import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("outputs", "control_dashboard");
const outPath = path.join(outDir, "control_data.json");

const juneFiles = [
  {
    sede: "Trim 1 - Mendiburu",
    file: "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Mendiburu.xls",
  },
  {
    sede: "Trim 2 - Balboa",
    file: "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Balboa.xls",
  },
  {
    sede: "Trim 3 - Benavides",
    file: "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Benavides.xls",
  },
];

const manualJuneRows = [
  {
    Sede: "Trim 2 - Balboa",
    Mes: "2026-06",
    "Mes nombre": "",
    Inscripcion: "30/06/2026 10:27:0 PM",
    "Fecha inicio": "01/07/2026",
    "Fecha fin": "31/07/2026",
    "Estado actual": "",
    "Tipo plan": "Renovacion",
    Origen: "Renovacion",
    "Tipo servicio": "MEMBRESÍA",
    Tiempo: "1 mes",
    Codigo: "186",
    Cliente: "JORGE LUIS PALAO ATO",
    "Cliente norm": "jorge luis palao ato",
    DNI: "10784337",
    Celular: "51998281594",
    Costo: 549,
    Pago: 549,
    Debe: 0,
    Vendedor: "sbstn",
    "Atribuido agencia": "No",
  },
  {
    Sede: "Trim 3 - Benavides",
    Mes: "2026-06",
    "Mes nombre": "",
    Inscripcion: "30/06/2026 10:34:0 PM",
    "Fecha inicio": "01/06/2026",
    "Fecha fin": "01/07/2026",
    "Estado actual": "",
    "Tipo plan": "Renovacion",
    Origen: "Renovacion",
    "Tipo servicio": "MEMBRESÍA",
    Tiempo: "1 mes",
    Codigo: "58",
    Cliente: "Marcela Diaz Fernandez",
    "Cliente norm": "marcela diaz fernandez",
    DNI: "40067519",
    Celular: "998107367",
    Costo: 579,
    Pago: 579,
    Debe: 0,
    Vendedor: "ventasnoe",
    "Atribuido agencia": "No",
  },
];

function decodeEntities(text) {
  return String(text ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(text) {
  return decodeEntities(String(text ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function normalize(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseMoney(value) {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function isMatriculaServicio(servicio) {
  return normalize(servicio).includes("matric");
}

function monthFromDateText(text) {
  const match = String(text ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return "";
  return `${match[3]}-${String(match[2]).padStart(2, "0")}`;
}

function parseHtmlTable(html) {
  const rows = [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((m) =>
    [...m[0].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((c) => stripTags(c[1])),
  );
  const header = rows.find((r) => r.includes("TIPO PLAN") && r.includes("VENDEDOR"));
  const headerIndex = rows.indexOf(header);
  if (!header || headerIndex < 0) throw new Error("No se encontro el encabezado esperado.");
  return rows.slice(headerIndex + 1).filter((r) => r.length >= header.length).map((row) => {
    const out = {};
    header.forEach((h, i) => {
      out[h] = row[i] ?? "";
    });
    return out;
  });
}

function toControlRow(sede, row) {
  const cliente = `${row.NOMBRES ?? ""} ${row.APELLIDOS ?? ""}`.replace(/\s+/g, " ").trim();
  return {
    Sede: sede,
    Mes: monthFromDateText(row.INSCRIPCION),
    "Mes nombre": "",
    Inscripcion: row.INSCRIPCION ?? "",
    "Fecha inicio": row["FECHA INICIO"] ?? "",
    "Fecha fin": row["FECHA FIN"] ?? "",
    "Estado actual": row["ESTADO ACTUAL"] || row.ESTADO || "",
    "Tipo plan": isMatriculaServicio(row["TIPO SERVICIO"]) ? "Nuevo" : row["TIPO PLAN"] ?? "",
    Origen: row.ORIGEN ?? "",
    "Tipo servicio": row["TIPO SERVICIO"] ?? "",
    Tiempo: row.TIEMPO ?? "",
    Codigo: row.CODIGO ?? "",
    Cliente: cliente,
    "Cliente norm": normalize(cliente),
    DNI: row.DNI ?? "",
    Celular: row.CELULAR ?? "",
    Costo: parseMoney(row.COSTO),
    Pago: parseMoney(row.PAGO),
    Debe: parseMoney(row.DEBE),
    Vendedor: row.VENDEDOR ?? "",
    "Atribuido agencia": "No",
  };
}

function group(rows, keyFn, initFn, stepFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, initFn(row, key));
    stepFn(map.get(key), row);
  }
  return [...map.values()];
}

function buildMonthly(ventas) {
  return group(
    ventas,
    (r) => `${r.Sede}|${r.Mes}`,
    (r) => ({
      Sede: r.Sede,
      Mes: r.Mes,
      "Venta total": 0,
      Transacciones: 0,
      Nuevos: 0,
      Renovaciones: 0,
      Reinscripciones: 0,
      "Clientes unicos": new Set(),
      "Atribuido agencia": 0,
      "Clientes activos": new Set(),
    }),
    (s, r) => {
      s["Venta total"] += Number(r.Pago || 0);
      if (!isMatriculaServicio(r["Tipo servicio"])) s.Transacciones += 1;
      s.Nuevos += !isMatriculaServicio(r["Tipo servicio"]) && normalize(r["Tipo plan"]) === "nuevo" ? 1 : 0;
      s.Renovaciones += !isMatriculaServicio(r["Tipo servicio"]) && normalize(r["Tipo plan"]) === "renovacion" ? 1 : 0;
      s.Reinscripciones += !isMatriculaServicio(r["Tipo servicio"]) && normalize(r["Tipo plan"]) === "reinscripcion" ? 1 : 0;
      s["Clientes unicos"].add(r["Cliente norm"]);
      if (r["Atribuido agencia"] === "Si") s["Atribuido agencia"] += Number(r.Pago || 0);
      if (r["Estado actual"] === "Activo") s["Clientes activos"].add(r["Cliente norm"]);
    },
  )
    .map((r) => ({
      ...r,
      "Clientes unicos": r["Clientes unicos"].size,
      "Clientes activos": r["Clientes activos"].size,
    }))
    .sort((a, b) => `${a.Sede}|${a.Mes}`.localeCompare(`${b.Sede}|${b.Mes}`));
}

function buildSources(ventas) {
  return group(
    ventas,
    (r) => `${r.Sede}|${r.Mes}|${r.Origen}`,
    (r) => ({ Sede: r.Sede, Mes: r.Mes, Origen: r.Origen, Venta: 0, Transacciones: 0, Nuevos: 0 }),
    (s, r) => {
      s.Venta += Number(r.Pago || 0);
      if (!isMatriculaServicio(r["Tipo servicio"])) s.Transacciones += 1;
      s.Nuevos += !isMatriculaServicio(r["Tipo servicio"]) && normalize(r["Tipo plan"]) === "nuevo" ? 1 : 0;
    },
  ).sort((a, b) => `${a.Sede}|${a.Mes}|${a.Origen}`.localeCompare(`${b.Sede}|${b.Mes}|${b.Origen}`));
}

function controlSaleKey(r) {
  return [
    r.Sede,
    r.DNI || r.Celular || r["Cliente norm"],
    r["Tipo plan"],
    r["Tipo servicio"],
    r.Inscripcion,
    r["Fecha inicio"],
    r["Fecha fin"],
    r.Pago,
  ].join("|");
}

const previous = JSON.parse(await fs.readFile(outPath, "utf8"));
const juneRows = [];
for (const { sede, file } of juneFiles) {
  const parsed = parseHtmlTable(await fs.readFile(file, "utf8"))
    .map((row) => toControlRow(sede, row))
    .filter((row) => row.Mes === "2026-06");
  juneRows.push(...parsed);
}

const replacementSedes = new Set(juneFiles.map((f) => f.sede));
const baseRows = (previous.ventas || []).filter((row) => !(replacementSedes.has(row.Sede) && row.Mes === "2026-06"));
const seen = new Set(juneRows.map(controlSaleKey));
for (const row of manualJuneRows) {
  const key = controlSaleKey(row);
  if (!seen.has(key)) {
    juneRows.push(row);
    seen.add(key);
  }
}
const ventas = [...baseRows, ...juneRows].sort((a, b) =>
  `${a.Sede}|${a.Mes}|${a.Inscripcion}|${a.Cliente}`.localeCompare(`${b.Sede}|${b.Mes}|${b.Inscripcion}|${b.Cliente}`),
);

await fs.writeFile(
  outPath,
  JSON.stringify(
    {
      ventas,
      monthly: buildMonthly(ventas),
      sources: buildSources(ventas),
    },
    null,
    2,
  ),
  "utf8",
);

const juneSummary = group(
  juneRows,
  (r) => r.Sede,
  (r) => ({ Sede: r.Sede, Venta: 0, Tx: 0 }),
  (s, r) => {
    s.Venta += Number(r.Pago || 0);
    s.Tx += 1;
  },
);
console.log(JSON.stringify(juneSummary, null, 2));
