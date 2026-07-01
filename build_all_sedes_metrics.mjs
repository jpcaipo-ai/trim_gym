import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const today = new Date(2026, 5, 30);
const outDir = path.resolve("outputs", "metricas_3_sedes");
const outPath = path.join(outDir, "metricas_ltv_churn_3_sedes.xlsx");

function extractLiteral(source, name) {
  const start = source.indexOf(`const ${name} = `);
  if (start < 0) throw new Error(`No encontre ${name}`);
  const valueStart = source.indexOf("=", start) + 1;
  const end = source.indexOf(";\n", valueStart);
  return source.slice(valueStart, end).trim();
}

const trim1Source = await fs.readFile("build_trim1_cross.mjs", "utf8");
const trim23Source = await fs.readFile("build_trim2_trim3_cross.mjs", "utf8");
const trim1Clients = Function(`return ${extractLiteral(trim1Source, "clients")}`)();
const trim23Reports = Function(`return ${extractLiteral(trim23Source, "reports")}`)();

const reports = [
  {
    trim: "Trim 1 - Mendiburu",
    sourcePath: "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (14).xls",
    sourcePaths: [
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (14).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes - Mendiburu.xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim Mendiburu).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Mendiburu).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim 1 - Mendiburu).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (mendiburu) (2).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Mendiburu.xls",
    ],
    clients: trim1Clients,
  },
  ...trim23Reports,
];

function decodeEntities(text) {
  return text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function stripTags(text) {
  return decodeEntities(text.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
function normalize(text) {
  return String(text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]+/g, " ").toLowerCase().replace(/\s+/g, " ").trim();
}
function digits(text) {
  return String(text ?? "").replace(/\D/g, "");
}
function parseMoney(value) {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function isMatricula(row) {
  return normalize(row["TIPO SERVICIO"]).includes("matric");
}
function logicalPurchaseRows(rows) {
  const purchases = rows.filter((r) => !isMatricula(r));
  return purchases.length ? purchases : rows;
}
function parseDate(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}
function monthsBetween(a, b) {
  return (b - a) / (1000 * 60 * 60 * 24 * 30.4375);
}
function parseHtmlTable(html) {
  const rows = [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((m) => [...m[0].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((c) => stripTags(c[1])));
  const header = rows.find((r) => r.includes("TIPO PLAN") && r.includes("VENDEDOR"));
  const headerIndex = rows.indexOf(header);
  if (!header || headerIndex < 0) throw new Error("No se encontro el encabezado esperado.");
  return rows.slice(headerIndex + 1).filter((r) => r.length >= header.length).map((row) => {
    const out = {};
    header.forEach((h, i) => { out[h] = row[i] ?? ""; });
    out.COSTO = parseMoney(out.COSTO);
    out.PAGO = parseMoney(out.PAGO);
    out.DEBE = parseMoney(out.DEBE);
    out.FULL = `${out.NOMBRES ?? ""} ${out.APELLIDOS ?? ""}`.replace(/\s+/g, " ").trim();
    out.NORM = normalize(out.FULL);
    out.PHONE_DIGITS = digits(out.CELULAR);
    out.DNI_DIGITS = digits(out.DNI);
    out.INSCRIPCION_DATE = parseDate(out.INSCRIPCION);
    out.FIN_DATE = parseDate(out["FECHA FIN"]);
    return out;
  });
}
function manualSale(row) {
  const out = {
    "TIPO PLAN": row.tipoPlan,
    ORIGEN: row.origen,
    "TIPO SERVICIO": row.tipoServicio,
    TIEMPO: row.tiempo,
    CODIGO: row.codigo,
    NOMBRES: row.nombres,
    APELLIDOS: row.apellidos,
    DNI: row.dni,
    CELULAR: row.celular,
    INSCRIPCION: row.inscripcion,
    "FECHA INICIO": row.inicio,
    "FECHA FIN": row.fin,
    COSTO: row.costo,
    PAGO: row.pago,
    DEBE: row.debe,
    VENDEDOR: row.vendedor,
  };
  out.FULL = `${out.NOMBRES ?? ""} ${out.APELLIDOS ?? ""}`.replace(/\s+/g, " ").trim();
  out.NORM = normalize(out.FULL);
  out.PHONE_DIGITS = digits(out.CELULAR);
  out.DNI_DIGITS = digits(out.DNI);
  out.INSCRIPCION_DATE = parseDate(out.INSCRIPCION);
  out.FIN_DATE = parseDate(out["FECHA FIN"]);
  return out;
}
function saleKey(r) {
  return [
    r.DNI_DIGITS || r.PHONE_DIGITS || r.NORM,
    r["TIPO PLAN"],
    r["TIPO SERVICIO"],
    r.INSCRIPCION,
    r["FECHA INICIO"],
    r["FECHA FIN"],
    r.COSTO,
    r.PAGO,
  ].join("|");
}
async function parseSalesFiles(paths) {
  const seen = new Set();
  const all = [];
  for (const filePath of paths) {
    const rows = parseHtmlTable(await fs.readFile(filePath, "utf8"));
    for (const row of rows) {
      const key = saleKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(row);
    }
  }
  return all;
}
function samePersonRows(rows, seedRows) {
  const dnis = new Set(seedRows.map((r) => r.DNI_DIGITS).filter((v) => v && v.length >= 5));
  const phones = new Set(seedRows.map((r) => r.PHONE_DIGITS).filter((v) => v && v.length >= 9));
  return rows.filter((r) => {
    const dniHit = r.DNI_DIGITS && dnis.has(r.DNI_DIGITS);
    const phoneHit = r.PHONE_DIGITS && r.PHONE_DIGITS.length >= 9 && [...phones].some((p) => r.PHONE_DIGITS.endsWith(p) || p.endsWith(r.PHONE_DIGITS));
    return dniHit || phoneHit;
  });
}
function findClient(rows, client) {
  const clientPhone = digits(client.phone);
  let seeds = [];
  let matchType = "Nombre exacto";
  if (clientPhone && clientPhone.length >= 9) {
    seeds = rows.filter((r) => r.PHONE_DIGITS.length >= 9 && (r.PHONE_DIGITS.endsWith(clientPhone) || clientPhone.endsWith(r.PHONE_DIGITS)));
    matchType = "Telefono";
  }
  if (!seeds.length) {
    const terms = normalize(client.name).split(" ").filter(Boolean);
    seeds = rows.filter((r) => terms.every((t) => r.NORM.includes(t)));
    matchType = "Nombre exacto";
  }
  if (!seeds.length && client.name === "Edith Tapia") {
    seeds = rows.filter((r) => normalize(r.NOMBRES) === "edith" && r.COSTO === 2219);
    matchType = "Posible: nombre+monto";
  }
  const personRows = samePersonRows(rows, seeds).sort((a, b) => (a.INSCRIPCION_DATE ?? 0) - (b.INSCRIPCION_DATE ?? 0));
  return { matchType: seeds.length ? matchType : "Sin match", rows: personRows };
}
function avg(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function percentile(values, p) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

const customerRows = [];
const purchaseRows = [];
const customerHeaders = [
  "Sede", "Mes captura", "Cliente captura", "Telefono captura", "Monto captura", "Fuente captura", "Match usado", "Cliente Excel", "DNI", "Celular Excel", "Compras total", "Compras posteriores", "Total pagado", "Total costo", "Primera compra", "Ultima compra", "Ultima fecha fin", "Estado a 30/06/2026", "Frecuencia promedio meses", "Ticket promedio", "Observaciones",
];
const purchaseHeaders = [
  "Sede", "Mes captura", "Cliente captura", "Match usado", "Cliente Excel", "DNI", "Celular", "Tipo plan", "Origen", "Tipo servicio", "Tiempo", "Inscripcion", "Fecha inicio", "Fecha fin", "Costo", "Pago", "Debe", "Vendedor",
];

for (const report of reports) {
  const sales = [...await parseSalesFiles(report.sourcePaths ?? [report.sourcePath]), ...(report.manualSales ?? []).map(manualSale)];
  for (const client of report.clients) {
    const { matchType, rows } = findClient(sales, client);
    const logicalRows = logicalPurchaseRows(rows);
    const paid = rows.reduce((acc, r) => acc + r.PAGO, 0);
    const costs = rows.reduce((acc, r) => acc + r.COSTO, 0);
    const firstDate = logicalRows[0]?.INSCRIPCION_DATE ?? rows[0]?.INSCRIPCION_DATE ?? null;
    const lastDate = logicalRows.at(-1)?.INSCRIPCION_DATE ?? rows.at(-1)?.INSCRIPCION_DATE ?? null;
    const lastEnd = rows.map((r) => r.FIN_DATE).filter(Boolean).sort((a, b) => a - b).at(-1) ?? null;
    const intervals = [];
    for (let i = 1; i < logicalRows.length; i += 1) {
      if (logicalRows[i - 1].INSCRIPCION_DATE && logicalRows[i].INSCRIPCION_DATE) intervals.push(monthsBetween(logicalRows[i - 1].INSCRIPCION_DATE, logicalRows[i].INSCRIPCION_DATE));
    }
    const active = lastEnd ? lastEnd >= today : false;
    const churned = rows.length ? !active : false;
    customerRows.push([
      report.trim,
      client.month,
      client.name,
      client.phone ?? "",
      client.amount ?? "",
      client.source,
      matchType,
      rows[0]?.FULL ?? "",
      rows[0]?.DNI ?? "",
      rows[0]?.CELULAR ?? "",
      logicalRows.length,
      Math.max(logicalRows.length - 1, 0),
      paid,
      costs,
      firstDate ? logicalRows[0]?.INSCRIPCION ?? rows[0].INSCRIPCION : "",
      lastDate ? logicalRows.at(-1)?.INSCRIPCION ?? rows.at(-1).INSCRIPCION : "",
      lastEnd ? rows.findLast?.((r) => r.FIN_DATE?.getTime() === lastEnd.getTime())?.["FECHA FIN"] ?? "" : "",
      active ? "Activo" : rows.length ? "Churn observado" : "No encontrado",
      intervals.length ? avg(intervals) : "",
      logicalRows.length ? paid / logicalRows.length : "",
      rows.length ? "" : "No encontrado en ventas.",
    ]);
    for (const r of rows) {
      purchaseRows.push([
        report.trim,
        client.month,
        client.name,
        matchType,
        r.FULL,
        r.DNI,
        r.CELULAR,
        r["TIPO PLAN"],
        r.ORIGEN,
        r["TIPO SERVICIO"],
        r.TIEMPO,
        r.INSCRIPCION,
        r["FECHA INICIO"],
        r["FECHA FIN"],
        r.COSTO,
        r.PAGO,
        r.DEBE,
        r.VENDEDOR,
      ]);
    }
  }
}

const metricRows = [];
for (const report of reports) {
  const rows = customerRows.filter((r) => r[0] === report.trim);
  const matched = rows.filter((r) => r[10] > 0);
  const repeaters = matched.filter((r) => r[11] > 0);
  const churned = matched.filter((r) => r[17] === "Churn observado");
  const ltvValues = matched.map((r) => r[12]);
  const freqValues = repeaters.map((r) => Number(r[18])).filter(Number.isFinite);
  metricRows.push([
    report.trim,
    rows.length,
    matched.length,
    matched.reduce((a, r) => a + r[10], 0),
    matched.reduce((a, r) => a + r[12], 0),
    avg(ltvValues),
    median(ltvValues),
    percentile(ltvValues, 75),
    repeaters.length,
    matched.length ? repeaters.length / matched.length : 0,
    avg(freqValues),
    median(freqValues),
    churned.length,
    matched.length ? churned.length / matched.length : 0,
    matched.length - churned.length,
  ]);
}
const matchedAll = customerRows.filter((r) => r[10] > 0);
const repeatAll = matchedAll.filter((r) => r[11] > 0);
const churnAll = matchedAll.filter((r) => r[17] === "Churn observado");
const ltvAll = matchedAll.map((r) => r[12]);
const freqAll = repeatAll.map((r) => Number(r[18])).filter(Number.isFinite);
metricRows.push([
  "Total 3 sedes",
  customerRows.length,
  matchedAll.length,
  matchedAll.reduce((a, r) => a + r[10], 0),
  matchedAll.reduce((a, r) => a + r[12], 0),
  avg(ltvAll),
  median(ltvAll),
  percentile(ltvAll, 75),
  repeatAll.length,
  matchedAll.length ? repeatAll.length / matchedAll.length : 0,
  avg(freqAll),
  median(freqAll),
  churnAll.length,
  matchedAll.length ? churnAll.length / matchedAll.length : 0,
  matchedAll.length - churnAll.length,
]);

const topRows = [...matchedAll]
  .sort((a, b) => b[12] - a[12])
  .slice(0, 20)
  .map((r, idx) => [idx + 1, r[0], r[2], r[7], r[10], r[12], r[17], r[18] || ""]);

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Metricas");
const clientes = workbook.worksheets.add("Clientes");
const compras = workbook.worksheets.add("Compras");
const defs = workbook.worksheets.add("Definiciones");

dashboard.getRange("A1:O1").merge();
dashboard.getRange("A1").values = [["Metricas alto impacto | Clientes generados por Trim Gym | Corte 30/06/2026"]];
dashboard.getRange("A3:O8").values = [
  ["Sede", "Clientes visibles", "Clientes encontrados", "Compras totales", "Total pagado", "LTV promedio", "LTV mediana", "LTV P75", "Clientes recompra", "% recompra", "Frecuencia prom meses", "Frecuencia mediana meses", "Churn clientes", "% churn observado", "Clientes activos"],
  ...metricRows,
];
dashboard.getRange("A11:H31").values = [
  ["Rank", "Sede", "Cliente captura", "Cliente Excel", "Compras", "LTV", "Estado", "Frecuencia meses"],
  ...topRows,
];

clientes.getRange(`A1:U${1 + customerRows.length}`).values = [[
  ...customerHeaders,
], ...customerRows];
compras.getRange(`A1:R${1 + purchaseRows.length}`).values = [[
  ...purchaseHeaders,
], ...purchaseRows];
defs.getRange("A1:B8").values = [
  ["Metrica", "Definicion usada"],
  ["LTV", "Total pagado acumulado en el Excel por cada cliente adquirido; promedio por sede y total."],
  ["Frecuencia de compra", "Meses promedio entre inscripciones/compras consecutivas, solo para clientes con recompra."],
  ["Churn observado", "Cliente encontrado cuya ultima FECHA FIN es anterior al 30/06/2026."],
  ["Activo", "Cliente encontrado con ultima FECHA FIN igual o posterior al 30/06/2026."],
  ["Clientes visibles", "Clientes que aparecen en las capturas/listas entregadas."],
  ["Compras posteriores", "Compras totales menos la primera compra encontrada del cliente."],
  ["Nota", "Edith Tapia se mantiene como match posible con EDITH MORI; validar si se requiere excluirla."],
];

for (const sheet of [dashboard, clientes, compras, defs]) {
  sheet.getRange("A:Z").format.font = { name: "Calibri", size: 10 };
}
dashboard.freezePanes.freezeRows(3);
clientes.freezePanes.freezeRows(1);
compras.freezePanes.freezeRows(1);
dashboard.getRange("A1:O1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF", size: 14 }, horizontalAlignment: "center" };
dashboard.getRange("A3:O3").format = { fill: "#E8F1F8", font: { bold: true, color: "#17324D" }, horizontalAlignment: "center", wrapText: true };
dashboard.getRange("A11:H11").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
clientes.getRange("A1:U1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
compras.getRange("A1:R1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
defs.getRange("A1:B1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" } };

dashboard.getRange("A:O").format.columnWidthPx = 125;
dashboard.getRange("A:A").format.columnWidthPx = 155;
dashboard.getRange("F:H").format.numberFormat = '"S/ "#,##0.00';
dashboard.getRange("E:E").format.numberFormat = '"S/ "#,##0.00';
dashboard.getRange("J:J").format.numberFormat = "0.0%";
dashboard.getRange("N:N").format.numberFormat = "0.0%";
dashboard.getRange("K:L").format.numberFormat = "0.00";
dashboard.getRange("F:F").format.numberFormat = '"S/ "#,##0.00';
dashboard.getRange("F31:F31").format.numberFormat = '"S/ "#,##0.00';
clientes.getRange("A:U").format.columnWidthPx = 120;
clientes.getRange("C:C").format.columnWidthPx = 180;
clientes.getRange("H:H").format.columnWidthPx = 210;
clientes.getRange("M:N").format.numberFormat = '"S/ "#,##0.00';
clientes.getRange("E:E").format.numberFormat = '"S/ "#,##0.00';
clientes.getRange("S:T").format.numberFormat = "0.00";
compras.getRange("A:R").format.columnWidthPx = 120;
compras.getRange("E:E").format.columnWidthPx = 210;
compras.getRange("O:Q").format.numberFormat = '"S/ "#,##0.00';
defs.getRange("A:A").format.columnWidthPx = 180;
defs.getRange("B:B").format.columnWidthPx = 680;
defs.getRange("B:B").format.wrapText = true;

console.log((await workbook.inspect({ kind: "table", range: "Metricas!A3:O8", include: "values", tableMaxRows: 8, tableMaxCols: 15 })).ndjson);
console.log((await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 } })).ndjson);
await workbook.render({ sheetName: "Metricas", range: "A1:O31", scale: 1 });
await workbook.render({ sheetName: "Clientes", range: "A1:U20", scale: 1 });
await workbook.render({ sheetName: "Compras", range: "A1:R20", scale: 1 });

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "base_metricas_data.json"), JSON.stringify({
  Clientes: customerRows.map((row) => Object.fromEntries(customerHeaders.map((header, index) => [header, row[index]]))),
  Compras: purchaseRows.map((row) => Object.fromEntries(purchaseHeaders.map((header, index) => [header, row[index]]))),
}, null, 2), "utf8");
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outPath);
console.log(outPath);
