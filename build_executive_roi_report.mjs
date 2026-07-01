import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const baseJsonPath = "C:\\Users\\jeanp\\Documents\\Codex\\2026-06-02\\files-mentioned-by-the-user-informematriculadosclientes\\outputs\\metricas_3_sedes\\base_metricas_data.json";
const outDir = path.resolve("outputs", "reporte_ejecutivo_roi");
const outPath = path.join(outDir, "reporte_ejecutivo_roi_trim_gym.xlsx");
const adsInvestment = 16000;
const serviceMonthly = 4300;
const serviceMonths = 5;
const serviceInvestment = serviceMonthly * serviceMonths;
const totalInvestment = adsInvestment + serviceInvestment;

function pct(n) {
  return Number.isFinite(n) ? n : 0;
}
function avg(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
function median(values) {
  const s = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function parseDate(value) {
  const m = String(value ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}
function fmtDate(value) {
  const d = parseDate(value);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const baseData = JSON.parse(await fs.readFile(baseJsonPath, "utf8"));
const clientes = baseData.Clientes;
const compras = baseData.Compras;
const visibleMatched = clientes.filter((r) => Number(r["Compras total"] ?? 0) > 0);
function customerKey(r) {
  const dni = String(r.DNI ?? "").trim();
  const cel = String(r["Celular Excel"] ?? "").replace(/\D/g, "");
  if (dni) return `${r.Sede}|DNI|${dni}`;
  if (cel.length >= 9) return `${r.Sede}|CEL|${cel}`;
  return `${r.Sede}|NAME|${String(r["Cliente Excel"] || r["Cliente captura"]).toLowerCase()}`;
}
const uniqueMap = new Map();
for (const row of visibleMatched) {
  const key = customerKey(row);
  const existing = uniqueMap.get(key);
  if (!existing || Number(row["Total pagado"] ?? 0) > Number(existing["Total pagado"] ?? 0)) uniqueMap.set(key, row);
}
const matched = [...uniqueMap.values()];
const totalRevenue = matched.reduce((acc, r) => acc + Number(r["Total pagado"] ?? 0), 0);
const totalClients = matched.length;
const totalPurchases = matched.reduce((acc, r) => acc + Number(r["Compras total"] ?? 0), 0);
const repeatClients = matched.filter((r) => Number(r["Compras posteriores"] ?? 0) > 0).length;
const activeClients = matched.filter((r) => r["Estado a 16/06/2026"] === "Activo").length;
const churnClients = matched.filter((r) => r["Estado a 16/06/2026"] === "Churn observado").length;
const ltvAvg = totalRevenue / totalClients;
const ticketAvg = totalRevenue / totalPurchases;
const topByPurchases = [...matched].sort((a, b) => Number(b["Compras total"]) - Number(a["Compras total"]) || Number(b["Total pagado"]) - Number(a["Total pagado"]));
const topByRevenue = [...matched].sort((a, b) => Number(b["Total pagado"]) - Number(a["Total pagado"]) || Number(b["Compras total"]) - Number(a["Compras total"]));
const oldest = [...matched].sort((a, b) => (parseDate(a["Primera compra"]) ?? 0) - (parseDate(b["Primera compra"]) ?? 0));

const bySede = [...new Set(matched.map((r) => r.Sede))].map((sede) => {
  const rows = matched.filter((r) => r.Sede === sede);
  const revenue = rows.reduce((a, r) => a + Number(r["Total pagado"] ?? 0), 0);
  const purchases = rows.reduce((a, r) => a + Number(r["Compras total"] ?? 0), 0);
  return [
    sede,
    rows.length,
    purchases,
    revenue,
    revenue / rows.length,
    revenue / purchases,
    rows.filter((r) => Number(r["Compras posteriores"] ?? 0) > 0).length / rows.length,
    rows.filter((r) => r["Estado a 16/06/2026"] === "Churn observado").length / rows.length,
    avg(rows.map((r) => Number(r["Frecuencia promedio meses"])).filter(Number.isFinite)),
  ];
});

const economics = [
  ["Total generado", totalRevenue],
  ["Clientes conseguidos", totalClients],
  ["Compras totales", totalPurchases],
  ["Ticket promedio por compra", ticketAvg],
  ["LTV promedio por cliente", ltvAvg],
  ["LTV mediana", median(matched.map((r) => Number(r["Total pagado"] ?? 0)))],
  ["Clientes con recompra", repeatClients],
  ["% recompra", repeatClients / totalClients],
  ["Clientes activos", activeClients],
  ["Clientes churn observado", churnClients],
  ["% churn observado", churnClients / totalClients],
  ["Inversion ads", adsInvestment],
  ["Fee servicio 5 meses", serviceInvestment],
  ["Inversion total ads + servicio", totalInvestment],
  ["ROAS ads", totalRevenue / adsInvestment],
  ["Retorno sobre inversion total", totalRevenue / totalInvestment],
  ["Utilidad neta despues de ads + servicio", totalRevenue - totalInvestment],
  ["ROI neto sobre inversion total", (totalRevenue - totalInvestment) / totalInvestment],
  ["CAC ads", adsInvestment / totalClients],
  ["CAC all-in", totalInvestment / totalClients],
  ["LTV / CAC ads", ltvAvg / (adsInvestment / totalClients)],
  ["LTV / CAC all-in", ltvAvg / (totalInvestment / totalClients)],
  ["Payback ads por cliente (compras)", (adsInvestment / totalClients) / ticketAvg],
  ["Payback all-in por cliente (compras)", (totalInvestment / totalClients) / ticketAvg],
];

const workbook = Workbook.create();
const exec = workbook.worksheets.add("Resumen ejecutivo");
const top = workbook.worksheets.add("Top clientes");
const old = workbook.worksheets.add("Antiguos");
const sedes = workbook.worksheets.add("Por sede");
const detalle = workbook.worksheets.add("Detalle clientes");
const comprasSheet = workbook.worksheets.add("Detalle compras");

exec.getRange("A1:H1").merge();
exec.getRange("A1").values = [["Reporte ejecutivo ROI | Trim Gym | 3 sedes | Corte 16/06/2026"]];
exec.getRange("A3:B26").values = [["Metrica", "Valor"], ...economics];
exec.getRange("D3:H8").values = [
  ["Lectura", "Valor", "", "", ""],
  ["Total generado", totalRevenue, "", "", ""],
  ["Inversion total", totalInvestment, "", "", ""],
  ["Neto generado", totalRevenue - totalInvestment, "", "", ""],
  ["Por cada S/ 1 all-in", totalRevenue / totalInvestment, "", "", ""],
  ["Por cada S/ 1 en ads", totalRevenue / adsInvestment, "", "", ""],
];

const topHeader = ["Rank", "Sede", "Cliente captura", "Cliente Excel", "Compras", "Compras posteriores", "Total generado", "Ticket promedio", "Primera compra", "Ultima compra", "Estado", "Frecuencia meses"];
top.getRange(`A1:L${1 + topByPurchases.length}`).values = [
  topHeader,
  ...topByPurchases.map((r, i) => [
    i + 1,
    r.Sede,
    r["Cliente captura"],
    r["Cliente Excel"],
    r["Compras total"],
    r["Compras posteriores"],
    r["Total pagado"],
    Number(r["Total pagado"]) / Number(r["Compras total"]),
    fmtDate(r["Primera compra"]),
    fmtDate(r["Ultima compra"]),
    r["Estado a 16/06/2026"],
    r["Frecuencia promedio meses"] || "",
  ]),
];
top.getRange("N1:W21").values = [
  ["Rank", "Sede", "Cliente captura", "Cliente Excel", "Total generado", "Compras", "Estado", "Primera compra", "Ultima compra", "Frecuencia meses"],
  ...topByRevenue.slice(0, 20).map((r, i) => [
    i + 1,
    r.Sede,
    r["Cliente captura"],
    r["Cliente Excel"],
    r["Total pagado"],
    r["Compras total"],
    r["Estado a 16/06/2026"],
    fmtDate(r["Primera compra"]),
    fmtDate(r["Ultima compra"]),
    r["Frecuencia promedio meses"] || "",
  ]),
];
old.getRange(`A1:L${1 + oldest.length}`).values = [
  topHeader,
  ...oldest.map((r, i) => [
    i + 1,
    r.Sede,
    r["Cliente captura"],
    r["Cliente Excel"],
    r["Compras total"],
    r["Compras posteriores"],
    r["Total pagado"],
    Number(r["Total pagado"]) / Number(r["Compras total"]),
    fmtDate(r["Primera compra"]),
    fmtDate(r["Ultima compra"]),
    r["Estado a 16/06/2026"],
    r["Frecuencia promedio meses"] || "",
  ]),
];
sedes.getRange(`A1:I${1 + bySede.length}`).values = [[
  "Sede", "Clientes", "Compras", "Total generado", "LTV promedio", "Ticket promedio", "% recompra", "% churn observado", "Frecuencia meses",
], ...bySede];

const detailHeader = Object.keys(clientes[0]);
detalle.getRange(`A1:U${1 + clientes.length}`).values = [detailHeader, ...clientes.map((r) => detailHeader.map((h) => r[h]))];
const comprasHeader = Object.keys(compras[0]);
comprasSheet.getRange(`A1:R${1 + compras.length}`).values = [comprasHeader, ...compras.map((r) => comprasHeader.map((h) => r[h]))];

for (const sheet of [exec, top, old, sedes, detalle, comprasSheet]) {
  sheet.getRange("A:Z").format.font = { name: "Calibri", size: 10 };
}
exec.getRange("A1:H1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF", size: 14 }, horizontalAlignment: "center" };
for (const range of ["A3:B3", "D3:H3"]) exec.getRange(range).format = { fill: "#E8F1F8", font: { bold: true, color: "#17324D" }, horizontalAlignment: "center" };
for (const sheet of [top, old, sedes, detalle, comprasSheet]) sheet.getRange("A1:Z1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
top.getRange("N1:W1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
exec.getRange("A:H").format.columnWidthPx = 145;
exec.getRange("A:A").format.columnWidthPx = 260;
exec.getRange("D:D").format.columnWidthPx = 220;
top.getRange("A:W").format.columnWidthPx = 125;
old.getRange("A:L").format.columnWidthPx = 125;
sedes.getRange("A:I").format.columnWidthPx = 135;
detalle.getRange("A:U").format.columnWidthPx = 120;
comprasSheet.getRange("A:R").format.columnWidthPx = 120;
top.getRange("C:D").format.columnWidthPx = 180;
top.getRange("P:Q").format.columnWidthPx = 180;
old.getRange("C:D").format.columnWidthPx = 180;
exec.getRange("B4:B8").format.numberFormat = '"S/ "#,##0.00';
exec.getRange("B15:B16").format.numberFormat = '"S/ "#,##0.00';
exec.getRange("B18:B21").format.numberFormat = '"S/ "#,##0.00';
exec.getRange("B10:B10").format.numberFormat = "0.0%";
exec.getRange("B13:B13").format.numberFormat = "0.0%";
exec.getRange("B17:B17").format.numberFormat = "0.00";
exec.getRange("B18:B18").format.numberFormat = "0.00";
exec.getRange("B20:B21").format.numberFormat = '"S/ "#,##0.00';
exec.getRange("B22:B23").format.numberFormat = "0.00";
exec.getRange("B24:B25").format.numberFormat = "0.00";
exec.getRange("D4:E8").format.numberFormat = '"S/ "#,##0.00';
exec.getRange("E7:E8").format.numberFormat = "0.00";
top.getRange("G:H").format.numberFormat = '"S/ "#,##0.00';
top.getRange("Q:Q").format.numberFormat = '"S/ "#,##0.00';
old.getRange("G:H").format.numberFormat = '"S/ "#,##0.00';
sedes.getRange("D:F").format.numberFormat = '"S/ "#,##0.00';
sedes.getRange("G:H").format.numberFormat = "0.0%";
detalle.getRange("E:E").format.numberFormat = '"S/ "#,##0.00';
detalle.getRange("M:N").format.numberFormat = '"S/ "#,##0.00';
comprasSheet.getRange("O:Q").format.numberFormat = '"S/ "#,##0.00';
exec.freezePanes.freezeRows(3);
top.freezePanes.freezeRows(1);
old.freezePanes.freezeRows(1);
sedes.freezePanes.freezeRows(1);
detalle.freezePanes.freezeRows(1);
comprasSheet.freezePanes.freezeRows(1);

console.log((await workbook.inspect({ kind: "table", range: "Resumen ejecutivo!A3:B26", include: "values", tableMaxRows: 26, tableMaxCols: 2 })).ndjson);
console.log((await workbook.inspect({ kind: "table", range: "Top clientes!A1:L12", include: "values", tableMaxRows: 12, tableMaxCols: 12 })).ndjson);
console.log((await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 } })).ndjson);
await workbook.render({ sheetName: "Resumen ejecutivo", range: "A1:H26", scale: 1 });
await workbook.render({ sheetName: "Top clientes", range: "A1:L25", scale: 1 });
await workbook.render({ sheetName: "Antiguos", range: "A1:L25", scale: 1 });
await workbook.render({ sheetName: "Por sede", range: "A1:I10", scale: 1 });

await fs.mkdir(outDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outPath);
console.log(outPath);
