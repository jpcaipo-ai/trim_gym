import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const sourcePath = "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (14).xls";
const sourcePaths = [
  sourcePath,
  "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes - Mendiburu.xls",
  "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim Mendiburu).xls",
  "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Mendiburu).xls",
  "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim 1 - Mendiburu).xls",
  "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (mendiburu) (2).xls",
  "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Mendiburu.xls",
];
const outDir = path.resolve("outputs", "trim1_mendiburu");
const outPath = path.join(outDir, "cruce_trim1_mendiburu_compras.xlsx");

const clients = [
  { month: "Enero 2026", name: "Edith Tapia", amount: 2219, source: "Instagram" },
  { month: "Enero 2026", name: "Andres Campos", amount: 99, source: "Form web" },
  { month: "Enero 2026", name: "Marilia Quispe", amount: 2069, source: "Form meta" },
  { month: "Enero 2026", name: "Eduardo Añaños", amount: 779, source: "Form web" },
  { month: "Enero 2026", name: "Gabriela Prendes", amount: 80, source: "Form web" },
  { month: "Febrero 2026", name: "Ruben Rivera", amount: 99, source: "Web" },
  { month: "Febrero 2026", name: "Franco Lizarraga", amount: 1169, source: "Form meta" },
  { month: "Febrero 2026", name: "Alejandra Melendez", amount: 859, source: "Web" },
  { month: "Febrero 2026", name: "Yessica Flores", amount: 150, source: "Instagram" },
  { month: "Febrero 2026", name: "Gino Peralta", amount: 779, source: "Form meta" },
  { month: "Febrero 2026", name: "Ivan Zamora", amount: 80, source: "Form web" },
  { month: "Febrero 2026", name: "Anelle Kaplisvsy", amount: 579, source: "Form web" },
  { month: "Marzo 2026", name: "Alexis Zorrilla", phone: "989834598", amount: 579, source: "Web" },
  { month: "Marzo 2026", name: "Jimena Oliva Respaldiza", phone: "969485253", amount: 859, source: "Instagram" },
  { month: "Marzo 2026", name: "Vannesa Oliva Respaldiza", phone: "994222283", amount: 859, source: "Instagram" },
  { month: "Marzo 2026", name: "Natalia Barreda", phone: "959206483", amount: 150, source: "Form meta" },
  { month: "Marzo 2026", name: "Karla Lopez", phone: "924699583", amount: 779, source: "Form Web" },
  { month: "Marzo 2026", name: "Stefanie Kronenberg", phone: "989246127", amount: 2219, source: "Instagram" },
  { month: "Abril 2026", name: "Jocelyne Jurado", phone: "966440064", amount: 1900, source: "Linktree" },
  { month: "Abril 2026", name: "Geraldine Caycho", phone: "939267977", amount: 1900, source: "Linktree" },
  { month: "Abril 2026", name: "Silvia Canales", phone: "985773253", amount: 1900, source: "Linktree" },
  { month: "Abril 2026", name: "Walter de la Torre", phone: "922218809", amount: 2219, source: "Form Meta" },
  { month: "Abril 2026", name: "Julian Cuadros", phone: "980636903", amount: 1900, source: "Linktree" },
  { month: "Abril 2026", name: "Oscar Dufour", phone: "987813637", amount: 1900, source: "Form Meta" },
  { month: "Abril 2026", name: "Mariana Viloria", phone: "997755931", amount: 1900, source: "Form Meta" },
  { month: "Abril 2026", name: "Romina Chirinos", phone: "962771928", amount: 1900, source: "Linktree" },
  { month: "Abril 2026", name: "Luis Rodriguez", phone: "959237010", amount: 1900, source: "Linktree" },
  { month: "Mayo 2026", name: "Mathias Brivio", phone: "999197080", amount: 2219, source: "Form Web" },
  { month: "Mayo 2026", name: "Fernando Chocano", phone: "986645733", amount: 2219, source: "Form Meta" },
  { month: "Mayo 2026", name: "Javier Bracco Puch", phone: "945678019", amount: 1900, source: "DM" },
  { month: "Mayo 2026", name: "Jose Espinoza", phone: "998119233", amount: 2219, source: "DM" },
  { month: "Mayo 2026", name: "Fernando Razeto", phone: "997511543", amount: 1900, source: "Digital" },
  { month: "Mayo 2026", name: "Claudia Namizato", phone: "951329266", amount: 1900, source: "Linktree" },
  { month: "Junio 2026", name: "Hernan Bello", phone: "955098767", amount: 1900, source: "DM" },
  { month: "Junio 2026", name: "Martha Velez", phone: "942126985", amount: 1900, source: "DM" },
  { month: "Junio 2026", name: "Renzo Sotomayor Diaz", phone: "983343707", amount: 1900, source: "Instagram" },
  { month: "Junio 2026", name: "Andres San Miguel", phone: "945127771", amount: 1900, source: "Linktree" },
  { month: "Junio 2026", name: "Manuel Montes de Oca", phone: "955929014", amount: 1900, source: "Linktree" },
  { month: "Junio 2026", name: "Beto Mendez", phone: "997921230", amount: 1900, source: "Linktree" },
  { month: "Junio 2026", name: "Nadia Gutierrez", phone: "51987504234", amount: 1900, source: "Digital" },
  { month: "Junio 2026", name: "Paolo Arauco", phone: "969714361", amount: 1900, source: "Linktree" },
  { month: "Junio 2026", name: "Eduardo Teran", phone: "51949429958", amount: 2219, source: "Form Web" },
  { month: "Junio 2026", name: "Mayte Carolina Pachas Paulino", phone: "51995551847", amount: 1900, source: "Mirko" },
];

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(text) {
  return decodeEntities(text.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
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

function parseHtmlTable(html) {
  const rows = [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((m) => {
    const cells = [...m[0].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((c) => stripTags(c[1]));
    return cells;
  });
  const header = rows.find((r) => r.includes("TIPO PLAN") && r.includes("VENDEDOR"));
  const headerIndex = rows.indexOf(header);
  if (!header || headerIndex < 0) throw new Error("No se encontro el encabezado esperado en el XLS/HTML.");
  return rows.slice(headerIndex + 1).filter((r) => r.length >= header.length).map((row) => {
    const out = {};
    header.forEach((h, i) => {
      out[h] = row[i] ?? "";
    });
    out.COSTO = parseMoney(out.COSTO);
    out.PAGO = parseMoney(out.PAGO);
    out.DEBE = parseMoney(out.DEBE);
    out.FULL = `${out.NOMBRES ?? ""} ${out.APELLIDOS ?? ""}`.replace(/\s+/g, " ").trim();
    out.NORM = normalize(out.FULL);
    out.PHONE_DIGITS = digits(out.CELULAR);
    out.DNI_DIGITS = digits(out.DNI);
    return out;
  });
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

  if (clientPhone) {
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

  const personRows = samePersonRows(rows, seeds).sort((a, b) => {
    const [da, ma, ya] = String(a.INSCRIPCION).split("/").map(Number);
    const [db, mb, yb] = String(b.INSCRIPCION).split("/").map(Number);
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  });

  return { matchType: seeds.length ? matchType : "Sin match", rows: personRows };
}

const sales = await parseSalesFiles(sourcePaths);
const detailRows = [];
const summaryRows = [];

for (const client of clients) {
  const { matchType, rows } = findClient(sales, client);
  const logicalRows = logicalPurchaseRows(rows);
  const totalPaid = rows.reduce((acc, r) => acc + r.PAGO, 0);
  const totalCost = rows.reduce((acc, r) => acc + r.COSTO, 0);
  const excelName = rows[0]?.FULL ?? "";
  const dni = rows[0]?.DNI ?? "";
  const phone = rows[0]?.CELULAR ?? "";
  const newCount = logicalRows.filter((r) => normalize(r["TIPO PLAN"]) === "nuevo").length + rows.filter(isMatricula).length;
  const renewalCount = logicalRows.filter((r) => normalize(r["TIPO PLAN"]) === "renovacion").length;
  const reinscriptionCount = rows.filter((r) => normalize(r["TIPO PLAN"]) === "reinscripcion").length;
  const obs = matchType.startsWith("Posible")
    ? "Validar: en Excel no aparece Tapia; se encontro EDITH MORI por nombre Edith y monto S/ 2,219."
    : rows.length
      ? ""
      : "No encontrado en ventas.";

  summaryRows.push([
    client.month,
    client.name,
    client.phone ?? "",
    client.amount,
    client.source,
    matchType,
    excelName,
    dni,
    phone,
    logicalRows.length,
    Math.max(logicalRows.length - 1, 0),
    totalPaid,
    totalCost,
    logicalRows[0]?.INSCRIPCION ?? rows[0]?.INSCRIPCION ?? "",
    logicalRows.at(-1)?.INSCRIPCION ?? rows.at(-1)?.INSCRIPCION ?? "",
    newCount,
    renewalCount,
    reinscriptionCount,
    obs,
  ]);

  for (const r of rows) {
    detailRows.push([
      client.month,
      client.name,
      client.phone ?? "",
      client.amount,
      client.source,
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

const matched = summaryRows.filter((r) => r[9] > 0).length;
const exactOrPhone = summaryRows.filter((r) => r[9] > 0 && !String(r[5]).startsWith("Posible")).length;
const possible = summaryRows.filter((r) => String(r[5]).startsWith("Posible")).length;
const repeatCustomers = summaryRows.filter((r) => r[10] > 0).length;
const totalPurchases = summaryRows.reduce((acc, r) => acc + r[9], 0);
const totalPaid = summaryRows.reduce((acc, r) => acc + r[11], 0);

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Resumen Trim 1");
const detail = workbook.worksheets.add("Detalle ventas");

summary.getRange("A1:S1").merge();
summary.getRange("A1").values = [["Cruce Trim 1 - Trim Mendiburu | Compras reales hasta 30/06/2026"]];
summary.getRange("A3:F4").values = [
  ["Clientes captura", "Matches exactos/tel", "Matches posibles", "Clientes con recompra", "Compras totales", "Total pagado Excel"],
  [clients.length, exactOrPhone, possible, repeatCustomers, totalPurchases, totalPaid],
];

const summaryHeader = [
  "Mes captura",
  "Cliente captura",
  "Telefono captura",
  "Monto captura",
  "Fuente captura",
  "Match usado",
  "Cliente Excel",
  "DNI",
  "Celular Excel",
  "Compras total",
  "Compras posteriores",
  "Total pagado Excel",
  "Total costo Excel",
  "Primera compra",
  "Ultima compra",
  "Nuevos",
  "Renovaciones",
  "Reinscripciones",
  "Observaciones",
];
summary.getRange(`A7:S${7 + summaryRows.length}`).values = [summaryHeader, ...summaryRows];

const detailHeader = [
  "Mes captura",
  "Cliente captura",
  "Telefono captura",
  "Monto captura",
  "Fuente captura",
  "Match usado",
  "Cliente Excel",
  "DNI",
  "Celular Excel",
  "Tipo plan",
  "Origen",
  "Tipo servicio",
  "Tiempo",
  "Inscripcion",
  "Fecha inicio",
  "Fecha fin",
  "Costo",
  "Pago",
  "Debe",
  "Vendedor",
];
detail.getRange(`A1:T${1 + detailRows.length}`).values = [detailHeader, ...detailRows];

for (const sheet of [summary, detail]) {
  sheet.freezePanes.freezeRows(sheet === summary ? 7 : 1);
  sheet.getRange("A:Z").format.font = { name: "Calibri", size: 10 };
}

summary.getRange("A1:S1").format = {
  fill: "#17324D",
  font: { name: "Calibri", size: 14, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
summary.getRange("A3:F3").format = {
  fill: "#E8F1F8",
  font: { bold: true, color: "#17324D" },
  horizontalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#B8C7D9" },
};
summary.getRange("A4:F4").format = {
  font: { bold: true },
  horizontalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#B8C7D9" },
};
summary.getRange("A7:S7").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  wrapText: true,
};
detail.getRange("A1:T1").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  wrapText: true,
};

summary.getRange("D:D").format.numberFormat = '"S/ "#,##0.00';
summary.getRange("L:M").format.numberFormat = '"S/ "#,##0.00';
summary.getRange("A:S").format.columnWidthPx = 120;
summary.getRange("B:B").format.columnWidthPx = 180;
summary.getRange("G:G").format.columnWidthPx = 210;
summary.getRange("S:S").format.columnWidthPx = 330;
summary.getRange("S:S").format.wrapText = true;
detail.getRange("A:T").format.columnWidthPx = 120;
detail.getRange("B:B").format.columnWidthPx = 180;
detail.getRange("G:G").format.columnWidthPx = 210;
detail.getRange("Q:R").format.numberFormat = '"S/ "#,##0.00';

const inspect = await workbook.inspect({
  kind: "table",
  range: "Resumen Trim 1!A1:S15",
  include: "values",
  tableMaxRows: 15,
  tableMaxCols: 19,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

await workbook.render({ sheetName: "Resumen Trim 1", range: "A1:S20", scale: 1 });
await workbook.render({ sheetName: "Detalle ventas", range: "A1:T20", scale: 1 });

await fs.mkdir(outDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outPath);
console.log(outPath);
