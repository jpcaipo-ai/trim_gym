import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const reports = [
  {
    trim: "Trim 2 - Balboa",
    sourcePath: "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Balboa).xls",
    sourcePaths: [
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Balboa).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Balboa) (2).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim Balboa).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Balboa) (3).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim 2 - Balboa).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes Balboa.xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Balboa.xls",
    ],
    clients: [
      { month: "Enero 2026", name: "Jorge Salcedo", amount: 779, source: "Form web" },
      { month: "Enero 2026", name: "Gian Carlo Diaz", amount: 579, source: "Web" },
      { month: "Enero 2026", name: "Alejandra Villanueva", amount: 579, source: "Form web" },
      { month: "Enero 2026", name: "Mabel Huertas", amount: 779, source: "Form web" },
      { month: "Febrero 2026", name: "Cecilia Cordova", amount: 779, source: "Form meta" },
      { month: "Febrero 2026", name: "Lucia Palma", amount: 579, source: "Web" },
      { month: "Febrero 2026", name: "Jahaira Barba", amount: 579, source: "Instagram" },
      { month: "Febrero 2026", name: "Mylene Tamayo", amount: 779, source: "Web" },
      { month: "Febrero 2026", name: "Pietro Solari", amount: 579, source: "Form meta" },
      { month: "Marzo 2026", name: "Marite Duare Casas", phone: "998278", amount: 579, source: "Web" },
      { month: "Marzo 2026", name: "Alessandra Olarte", phone: "970929", amount: 521, source: "Form Web" },
      { month: "Marzo 2026", name: "Patricia Barreto", phone: "980605", amount: 150, source: "Web" },
      { month: "Marzo 2026", name: "Natalia Liu", phone: "964661", amount: 1169, source: "Web" },
      { month: "Marzo 2026", name: "Valentina Esther", phone: "941345", amount: 579, source: "Instagram" },
      { month: "Marzo 2026", name: "Erika Manchego", phone: "991082", amount: 779, source: "Web" },
      { month: "Marzo 2026", name: "Arianne Caceres", phone: "958233", amount: 579, source: "Instagram" },
      { month: "Marzo 2026", name: "Daniela Huertas", phone: "952817", amount: 579, source: "Instagram" },
      { month: "Marzo 2026", name: "Patricia Pisano", phone: "99403759", amount: 579, source: "Form Meta" },
      { month: "Abril 2026", name: "Patricia Barreto", phone: "980605351", amount: 2219, source: "Web" },
      { month: "Mayo 2026", name: "Maria Puelles Diaz", phone: "987552143", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Cecilia Farfan", phone: "991031900", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Rocio Bolo Suasnabar", phone: "999135188", amount: 1900, source: "Linktree" },
      { month: "Junio 2026", name: "Marite Saavedra", phone: "976587879", amount: 2219, source: "Web" },
      { month: "Junio 2026", name: "Augusto Navarro", phone: "993849177", amount: 1900, source: "Web" },
      { month: "Junio 2026", name: "Pilar Olaechea", phone: "980728016", amount: 2219, source: "Form Web" },
      { month: "Junio 2026", name: "Renato Pareja", phone: "942459535", amount: 1900, source: "Digital" },
      { month: "Junio 2026", name: "Alejandra Leon", phone: "961270586", amount: 989, source: "Linktree" },
      { month: "Junio 2026", name: "Maria Margarita Garrido Lecca", phone: "938148533", amount: 1900, source: "Linktree" },
      { month: "Junio 2026", name: "Valery Sanchez Seminario", phone: "987571193", amount: 1900, source: "Linktree" },
      { month: "Junio 2026", name: "Gladys Castro", phone: "998880707", amount: 2219, source: "Linktree" },
      { month: "Junio 2026", name: "Zaira Naguila", phone: "51993313936", amount: 1900, source: "Linktree" },
    ],
  },
  {
    trim: "Trim 3 - Benavides",
    sourcePath: "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Benavides).xls",
    sourcePaths: [
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Benavides).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Benavides) (2).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim Benavides).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Benavides) (3).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (Trim 3 - Benavides).xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes Benavides.xls",
      "C:\\Users\\jeanp\\Downloads\\InformeMatriculadosClientes (17) - Benavides.xls",
    ],
    clients: [
      { month: "Enero 2026", name: "Stefani Canzio", amount: 2219, source: "Instagram" },
      { month: "Enero 2026", name: "Ruben Rojas", amount: 3029, source: "Form meta" },
      { month: "Enero 2026", name: "Ingrid Stange", phone: "987177966", amount: 2219, source: "Form meta" },
      { month: "Enero 2026", name: "Fabiola Pasapera", amount: 579, source: "Form meta" },
      { month: "Enero 2026", name: "Maria Paula Pacheco", amount: 579, source: "Web" },
      { month: "Febrero 2026", name: "Giuliana Hall", amount: 2219, source: "Instagram" },
      { month: "Febrero 2026", name: "Cesar Barboza", amount: 2219, source: "Form meta" },
      { month: "Febrero 2026", name: "Julio Bedoya", amount: 779, source: "Form meta" },
      { month: "Febrero 2026", name: "Eduardo Bedoya", amount: 779, source: "Form meta" },
      { month: "Febrero 2026", name: "Juliana Bisso de Hall", amount: 2219, source: "Form meta" },
      { month: "Febrero 2026", name: "Maria Constanza", amount: 579, source: "Form meta" },
      { month: "Febrero 2026", name: "Soren Canepa", amount: 1169, source: "Web" },
      { month: "Marzo 2026", name: "Matias Schreyer", phone: "99395164", amount: 2219, source: "Boost Instagram" },
      { month: "Marzo 2026", name: "Orissa Alvear", phone: "98278600", amount: 2219, source: "Boost Instagram" },
      { month: "Marzo 2026", name: "Vanessa Garcia", phone: "95158089", amount: 579, source: "Form meta" },
      { month: "Marzo 2026", name: "Brenda Florencio", phone: "97119417", amount: 779, source: "Web" },
      { month: "Marzo 2026", name: "Paola Rodriguez", phone: "98110391", amount: 579, source: "Form meta" },
      { month: "Marzo 2026", name: "Diana Vegas", phone: "95338686", amount: 579, source: "Form meta" },
      { month: "Marzo 2026", name: "Jose Viera", phone: "91643978", amount: 1169, source: "Form Web" },
      { month: "Marzo 2026", name: "Lourdes Pizon", phone: "99900755", amount: 579, source: "Form meta" },
      { month: "Marzo 2026", name: "Amalia Valdez", phone: "9918928", amount: 779, source: "Form Web" },
      { month: "Marzo 2026", name: "Estela Redhead", phone: "998133132", amount: 779, source: "Form Meta" },
      { month: "Marzo 2026", name: "Mariana Gore", phone: "99813451", amount: null, source: "Instagram DM" },
      { month: "Marzo 2026", name: "Cristel Chu", phone: "886905", amount: 579, source: "Web" },
      { month: "Marzo 2026", name: "Jorge Schanks", phone: "99338384", amount: 779, source: "Form Meta" },
      { month: "Marzo 2026", name: "Jorge Chang", phone: "94996610", amount: 779, source: "Instagram" },
      { month: "Marzo 2026", name: "Fernanda Crisostomo", phone: "9841917", amount: 579, source: "Instagram" },
      { month: "Abril 2026", name: "Beatriz de la Puente", phone: "994714994", amount: 3029, source: "Linktree" },
      { month: "Abril 2026", name: "Pedro Navarro", phone: "986630706", amount: 1900, source: "Form Meta" },
      { month: "Abril 2026", name: "Cecilia Soto", phone: "993091982", amount: 779, source: "Linktree" },
      { month: "Abril 2026", name: "Juan Arias", phone: "994631801", amount: 1900, source: "Form Meta" },
      { month: "Abril 2026", name: "Mariana Pereyra", phone: "959117835", amount: 579, source: "Linktree" },
      { month: "Abril 2026", name: "Paul Sablich", phone: "992759322", amount: 1900, source: "Form Meta" },
      { month: "Abril 2026", name: "Rosa Maria Clave", phone: "990005150", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Javier Jauregui", phone: "962370590", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Denise Herrera", phone: "965422034", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Alicia Matos", phone: "989778051", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Carolina Guillermo", phone: "986117928", amount: 1900, source: "Linktree" },
      { month: "Mayo 2026", name: "Carolina Quino", phone: "997672766", amount: 2219, source: "Digital" },
      { month: "Mayo 2026", name: "Karen Puskovitz", phone: "987210703", amount: 1900, source: "DM" },
      { month: "Mayo 2026", name: "Sonia del Pilar", phone: "997929021", amount: 1900, source: "Form Meta" },
      { month: "Mayo 2026", name: "Jimena Chocano", phone: "986370262", amount: 3029, source: "DM" },
      { month: "Junio 2026", name: "Yohana Cordova", phone: "974624703", amount: 1900, source: "Linktree" },
      { month: "Junio 2026", name: "Jimena Castro", phone: "962320190", amount: 779, source: "Form Meta" },
      { month: "Junio 2026", name: "Maria Teresa Sarmiento", phone: "19174976053", amount: 1900, source: "DM" },
      { month: "Junio 2026", name: "Teresa Lapeyre", phone: "980783515", amount: 1900, source: "Form Meta" },
      { month: "Junio 2026", name: "Pedro Casavilca", phone: "12035129505", amount: 1900, source: "DM" },
      { month: "Junio 2026", name: "Roberto Guerra Uribe", phone: "997930092", amount: 1900, source: "Linktree" },
      { month: "Junio 2026", name: "Jaime Gray", phone: "997638064", amount: 1900, source: "Form Meta" },
      { month: "Junio 2026", name: "Tatiana Egavil", phone: "975470279", amount: 1900, source: "Form Meta" },
      { month: "Junio 2026", name: "Giselle Pinto", phone: "990331965", amount: 1900, source: "Form Meta" },
      { month: "Junio 2026", name: "Ruben Soldevilla", phone: "941984061", amount: 1900, source: "Form Meta" },
      { month: "Junio 2026", name: "Luis Casaretto", phone: "51987110222", amount: 2219, source: "Form Meta" },
      { month: "Junio 2026", name: "Luis Godoy Yanjalla", phone: "51972633477", amount: 1900, source: "DM" },
      { month: "Junio 2026", name: "Carlos Alfonso del Castillo Mory", phone: "51993453905", amount: 1900, source: "DM" },
    ],
    manualSales: [],
  },
];

const outDir = path.resolve("outputs", "trim2_trim3");
const outPath = path.join(outDir, "cruce_trim2_balboa_trim3_benavides_compras.xlsx");

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
  const personRows = samePersonRows(rows, seeds).sort((a, b) => {
    const [da, ma, ya] = String(a.INSCRIPCION).split("/").map(Number);
    const [db, mb, yb] = String(b.INSCRIPCION).split("/").map(Number);
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  });
  return { matchType: seeds.length ? matchType : "Sin match", rows: personRows };
}
function addCurrencyFormat(sheet, range) {
  sheet.getRange(range).format.numberFormat = '"S/ "#,##0.00';
}

const workbook = Workbook.create();
const resumen = workbook.worksheets.add("Resumen");
const summaryRows = [];
const detailRows = [];

for (const report of reports) {
  const sales = [...await parseSalesFiles(report.sourcePaths ?? [report.sourcePath]), ...(report.manualSales ?? []).map(manualSale)];
  for (const client of report.clients) {
    const { matchType, rows } = findClient(sales, client);
    const logicalRows = logicalPurchaseRows(rows);
    const totalPaid = rows.reduce((acc, r) => acc + r.PAGO, 0);
    const totalCost = rows.reduce((acc, r) => acc + r.COSTO, 0);
    const newCount = logicalRows.filter((r) => normalize(r["TIPO PLAN"]) === "nuevo").length + rows.filter(isMatricula).length;
    const renewalCount = logicalRows.filter((r) => normalize(r["TIPO PLAN"]) === "renovacion").length;
    const reinscriptionCount = rows.filter((r) => normalize(r["TIPO PLAN"]) === "reinscripcion").length;
    summaryRows.push([
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
      totalPaid,
      totalCost,
      logicalRows[0]?.INSCRIPCION ?? rows[0]?.INSCRIPCION ?? "",
      logicalRows.at(-1)?.INSCRIPCION ?? rows.at(-1)?.INSCRIPCION ?? "",
      newCount,
      renewalCount,
      reinscriptionCount,
      rows.length ? "" : "No encontrado en ventas.",
    ]);
    for (const r of rows) {
      detailRows.push([
        report.trim,
        client.month,
        client.name,
        client.phone ?? "",
        client.amount ?? "",
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
}

const byTrim = reports.map((r) => {
  const rows = summaryRows.filter((row) => row[0] === r.trim);
  return [
    r.trim,
    rows.length,
    rows.filter((row) => row[10] > 0).length,
    rows.filter((row) => row[11] > 0).length,
    rows.reduce((acc, row) => acc + row[10], 0),
    rows.reduce((acc, row) => acc + row[12], 0),
  ];
});
const totalVisible = summaryRows.length;
const totalMatched = summaryRows.filter((row) => row[10] > 0).length;
const totalRepeat = summaryRows.filter((row) => row[11] > 0).length;
const totalPurchases = summaryRows.reduce((acc, row) => acc + row[10], 0);
const totalPaid = summaryRows.reduce((acc, row) => acc + row[12], 0);

resumen.getRange("A1:H1").merge();
resumen.getRange("A1").values = [["Cruce Trim 2 Balboa + Trim 3 Benavides | Compras reales hasta 30/06/2026"]];
resumen.getRange("A3:F6").values = [
  ["Sede", "Clientes visibles", "Clientes encontrados", "Clientes con recompra", "Compras totales", "Total pagado Excel"],
  ...byTrim,
  ["Total", totalVisible, totalMatched, totalRepeat, totalPurchases, totalPaid],
];
const header = [
  "Sede",
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
resumen.getRange(`A8:T${8 + summaryRows.length}`).values = [header, ...summaryRows];

const detalle = workbook.worksheets.add("Detalle ventas");
const detailHeader = [
  "Sede",
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
detalle.getRange(`A1:U${1 + detailRows.length}`).values = [detailHeader, ...detailRows];

for (const sheet of [resumen, detalle]) {
  sheet.getRange("A:Z").format.font = { name: "Calibri", size: 10 };
}
resumen.freezePanes.freezeRows(8);
detalle.freezePanes.freezeRows(1);
resumen.getRange("A1:H1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF", size: 14 }, horizontalAlignment: "center" };
resumen.getRange("A3:F3").format = { fill: "#E8F1F8", font: { bold: true, color: "#17324D" }, horizontalAlignment: "center", borders: { preset: "all", style: "thin", color: "#B8C7D9" } };
resumen.getRange("A4:F6").format = { borders: { preset: "all", style: "thin", color: "#B8C7D9" } };
resumen.getRange("A8:T8").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
detalle.getRange("A1:U1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
resumen.getRange("A:T").format.columnWidthPx = 120;
resumen.getRange("C:C").format.columnWidthPx = 185;
resumen.getRange("H:H").format.columnWidthPx = 210;
resumen.getRange("T:T").format.columnWidthPx = 240;
detalle.getRange("A:U").format.columnWidthPx = 120;
detalle.getRange("C:C").format.columnWidthPx = 185;
detalle.getRange("H:H").format.columnWidthPx = 210;
addCurrencyFormat(resumen, "E:E");
addCurrencyFormat(resumen, "M:N");
addCurrencyFormat(resumen, "F:F");
addCurrencyFormat(detalle, "E:E");
addCurrencyFormat(detalle, "R:T");

console.log((await workbook.inspect({ kind: "table", range: "Resumen!A1:F12", include: "values", tableMaxRows: 12, tableMaxCols: 6 })).ndjson);
console.log((await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" })).ndjson);
await workbook.render({ sheetName: "Resumen", range: "A1:T22", scale: 1 });
await workbook.render({ sheetName: "Detalle ventas", range: "A1:U20", scale: 1 });

await fs.mkdir(outDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outPath);
console.log(outPath);
