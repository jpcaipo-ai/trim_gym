import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const data = JSON.parse(await fs.readFile("outputs/control_dashboard/control_data.json", "utf8"));
const outDir = path.resolve("outputs", "control_dashboard");
const outPath = path.join(outDir, "tablero_control_trim_gym.xlsx");

const ventas = data.ventas;
const monthly = data.monthly;
const sources = data.sources;
const allSedes = ["Todos", ...new Set(ventas.map((r) => r.Sede).filter(Boolean))];
const allMonths = ["Todos", ...new Set(ventas.map((r) => r.Mes).filter(Boolean).sort())];
const allOrigins = ["Todos", ...new Set(ventas.map((r) => r.Origen).filter(Boolean).sort())];
const allPlans = ["Todos", ...new Set(ventas.map((r) => r["Tipo plan"]).filter(Boolean).sort())];

function money(n) {
  return Number(n ?? 0);
}
function pct(n) {
  return Number.isFinite(n) ? n : 0;
}
function byKey(rows, keyFn, initFn, stepFn) {
  const map = new Map();
  for (const r of rows) {
    const key = keyFn(r);
    if (!map.has(key)) map.set(key, initFn(r));
    stepFn(map.get(key), r);
  }
  return [...map.values()];
}
const totalVentas = ventas.reduce((a, r) => a + money(r.Pago), 0);
const transacciones = ventas.length;
const clientesUnicos = new Set(ventas.map((r) => `${r.Sede}|${r["Cliente norm"]}`).filter(Boolean)).size;
const ventasAtribuidas = ventas.filter((r) => r["Atribuido agencia"] === "Si").reduce((a, r) => a + money(r.Pago), 0);
const activosActuales = new Set(ventas.filter((r) => r["Estado actual"] === "Activo").map((r) => `${r.Sede}|${r["Cliente norm"]}`)).size;
const nuevos = ventas.filter((r) => String(r["Tipo plan"]).toLowerCase() === "nuevo").length;
const ticketPromedio = totalVentas / transacciones;

const monthlyAgg = monthly.map((r) => [
  r.Sede,
  r.Mes,
  r["Venta total"],
  r.Transacciones,
  r["Clientes unicos"],
  r["Clientes activos"],
  r.Nuevos,
  r.Renovaciones,
  r.Reinscripciones,
  r["Atribuido agencia"],
]);

const monthTotals = byKey(
  monthly,
  (r) => r.Mes,
  (r) => ({ Mes: r.Mes, Venta: 0, Nuevos: 0, Activos: 0 }),
  (s, r) => {
    s.Venta += money(r["Venta total"]);
    s.Nuevos += Number(r.Nuevos ?? 0);
    s.Activos += Number(r["Clientes activos"] ?? 0);
  },
).sort((a, b) => a.Mes.localeCompare(b.Mes));

const sourceTop = [...sources]
  .sort((a, b) => money(b.Venta) - money(a.Venta))
  .slice(0, 25)
  .map((r) => [r.Sede, r.Mes, r.Origen, r.Venta, r.Transacciones, r.Nuevos]);

const ventasRows = ventas.map((r) => [
  r.Sede,
  r.Mes,
  r.Inscripcion,
  r["Fecha inicio"],
  r["Fecha fin"],
  r["Estado actual"],
  r["Tipo plan"],
  r.Origen,
  r["Tipo servicio"],
  r.Tiempo,
  r.Codigo,
  r.Cliente,
  r.DNI,
  r.Celular,
  r.Costo,
  r.Pago,
  r.Debe,
  r.Vendedor,
  r["Atribuido agencia"],
]);

const workbook = Workbook.create();
const dash = workbook.worksheets.add("Dashboard");
const control = workbook.worksheets.add("Control mensual");
const fuentes = workbook.worksheets.add("Fuentes leads");
const raw = workbook.worksheets.add("Ventas filtrables");
const config = workbook.worksheets.add("Listas filtros");

dash.getRange("A1:L1").merge();
dash.getRange("A1").values = [["Tablero de control Trim Gym | Ventas, leads, clientes activos y atribucion"]];

dash.getRange("A3:H5").values = [
  ["Filtro", "Sede", "Filtro", "Mes", "Filtro", "Origen / lead", "Filtro", "Tipo plan"],
  ["Seleccion", "Todos", "Seleccion", "Todos", "Seleccion", "Todos", "Seleccion", "Todos"],
  ["Tip", "Cambia los desplegables azules", "", "Formato YYYY-MM", "", "Fuente del Excel", "", "Nuevo/Renovacion/etc."],
];

const n = ventasRows.length + 1;
const condSede = `--((($B$4="Todos")+('Ventas filtrables'!$A$2:$A$${n}=$B$4))>0)`;
const condMes = `--((($D$4="Todos")+('Ventas filtrables'!$B$2:$B$${n}=$D$4))>0)`;
const condOrigen = `--((($F$4="Todos")+('Ventas filtrables'!$H$2:$H$${n}=$F$4))>0)`;
const condPlan = `--((($H$4="Todos")+('Ventas filtrables'!$G$2:$G$${n}=$H$4))>0)`;
const filterCond = `${condSede}*${condMes}*${condOrigen}*${condPlan}`;
const filteredNames = `FILTER('Ventas filtrables'!$A$2:$A$${n}&"|"&'Ventas filtrables'!$L$2:$L$${n},${filterCond})`;
const filteredActive = `FILTER('Ventas filtrables'!$A$2:$A$${n}&"|"&'Ventas filtrables'!$L$2:$L$${n},${filterCond}*('Ventas filtrables'!$F$2:$F$${n}="Activo"))`;

dash.getRange("A7:L10").values = [
  ["Venta total", "Transacciones", "Clientes unicos", "Clientes activos", "Nuevos", "Ticket promedio", "Venta atrib. agencia", "% atribuido", "Renovaciones", "Reinscripciones", "Debe", "Activos %"],
  [null, null, null, null, null, null, null, null, null, null, null, null],
  ["Base completa", totalVentas, transacciones, clientesUnicos, activosActuales, nuevos, ticketPromedio, ventasAtribuidas, ventasAtribuidas / totalVentas, "", "", ""],
  ["Corte", "30/06/2026", "", "", "", "", "", "", "", "", "", ""],
];
dash.getRange("A8:L8").formulas = [[
  `=SUMPRODUCT(${filterCond}*'Ventas filtrables'!$P$2:$P$${n})`,
  `=SUMPRODUCT(${filterCond})`,
  `=IFERROR(COUNTA(UNIQUE(${filteredNames})),0)`,
  `=IFERROR(COUNTA(UNIQUE(${filteredActive})),0)`,
  `=SUMPRODUCT(${filterCond}*('Ventas filtrables'!$G$2:$G$${n}="Nuevo"))`,
  `=IFERROR(A8/B8,0)`,
  `=SUMPRODUCT(${filterCond}*('Ventas filtrables'!$S$2:$S$${n}="Si")*'Ventas filtrables'!$P$2:$P$${n})`,
  `=IFERROR(G8/A8,0)`,
  `=SUMPRODUCT(${filterCond}*('Ventas filtrables'!$G$2:$G$${n}="Renovacion"))`,
  `=SUMPRODUCT(${filterCond}*('Ventas filtrables'!$G$2:$G$${n}="Reinscripcion"))`,
  `=SUMPRODUCT(${filterCond}*'Ventas filtrables'!$Q$2:$Q$${n})`,
  `=IFERROR(D8/C8,0)`,
]];

dash.getRange("A13:J13").values = [["Mes", "Venta total", "Transacciones", "Clientes unicos", "Clientes activos", "Nuevos", "Renovaciones", "Reinscripciones", "Venta atrib. agencia", "% atribuido"]];
dash.getRange(`A14:J${13 + monthTotals.length}`).values = monthTotals.map((m) => {
  const rows = monthly.filter((r) => r.Mes === m.Mes);
  const venta = rows.reduce((a, r) => a + money(r["Venta total"]), 0);
  const tx = rows.reduce((a, r) => a + Number(r.Transacciones ?? 0), 0);
  const clientes = rows.reduce((a, r) => a + Number(r["Clientes unicos"] ?? 0), 0);
  const activos = rows.reduce((a, r) => a + Number(r["Clientes activos"] ?? 0), 0);
  const nuevosM = rows.reduce((a, r) => a + Number(r.Nuevos ?? 0), 0);
  const renov = rows.reduce((a, r) => a + Number(r.Renovaciones ?? 0), 0);
  const reins = rows.reduce((a, r) => a + Number(r.Reinscripciones ?? 0), 0);
  const atrib = rows.reduce((a, r) => a + money(r["Atribuido agencia"]), 0);
  return [m.Mes, venta, tx, clientes, activos, nuevosM, renov, reins, atrib, venta ? atrib / venta : 0];
});

dash.getRange("L13:Q13").values = [["Sede", "Venta", "Transacciones", "Clientes", "Activos", "% activo"]];
const sedeRows = byKey(
  ventas,
  (r) => r.Sede,
  (r) => ({ Sede: r.Sede, Venta: 0, Tx: 0, Clientes: new Set(), Activos: new Set() }),
  (s, r) => {
    s.Venta += money(r.Pago); s.Tx += 1; s.Clientes.add(r["Cliente norm"]);
    if (r["Estado actual"] === "Activo") s.Activos.add(r["Cliente norm"]);
  },
).map((s) => [s.Sede, s.Venta, s.Tx, s.Clientes.size, s.Activos.size, s.Clientes.size ? s.Activos.size / s.Clientes.size : 0]);
dash.getRange(`L14:Q${13 + sedeRows.length}`).values = sedeRows;

control.getRange(`A1:J${1 + monthlyAgg.length}`).values = [[
  "Sede", "Mes", "Venta total", "Transacciones", "Clientes unicos", "Clientes activos", "Nuevos", "Renovaciones", "Reinscripciones", "Venta atrib. agencia",
], ...monthlyAgg];

fuentes.getRange(`A1:F${1 + sources.length}`).values = [[
  "Sede", "Mes", "Origen / lead", "Venta", "Transacciones", "Nuevos",
], ...sources.map((r) => [r.Sede, r.Mes, r.Origen, r.Venta, r.Transacciones, r.Nuevos])];
fuentes.getRange("H1:M26").values = [["Sede", "Mes", "Origen / lead", "Venta", "Transacciones", "Nuevos"], ...sourceTop];

raw.getRange(`A1:S${1 + ventasRows.length}`).values = [[
  "Sede", "Mes", "Inscripcion", "Fecha inicio", "Fecha fin", "Estado actual", "Tipo plan", "Origen", "Tipo servicio", "Tiempo", "Codigo", "Cliente", "DNI", "Celular", "Costo", "Pago", "Debe", "Vendedor", "Atribuido agencia",
], ...ventasRows];

const maxLen = Math.max(allSedes.length, allMonths.length, allOrigins.length, allPlans.length);
const listRows = Array.from({ length: maxLen }, (_, i) => [allSedes[i] ?? "", allMonths[i] ?? "", allOrigins[i] ?? "", allPlans[i] ?? ""]);
config.getRange(`A1:D${maxLen + 1}`).values = [["Sedes", "Meses", "Origenes", "Tipo plan"], ...listRows];

dash.getRange("B4").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: allSedes } };
dash.getRange("D4").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: allMonths } };
dash.getRange("F4").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: allOrigins } };
dash.getRange("H4").dataValidation = { allowBlank: false, list: { inCellDropDown: true, source: allPlans } };

for (const sheet of [dash, control, fuentes, raw, config]) {
  sheet.getRange("A:Z").format.font = { name: "Calibri", size: 10 };
}
dash.getRange("A1:L1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF", size: 15 }, horizontalAlignment: "center" };
dash.getRange("A3:H3").format = { fill: "#E8F1F8", font: { bold: true, color: "#17324D" }, horizontalAlignment: "center" };
dash.getRange("B4,D4,F4,H4").format = { fill: "#DCEBFF", font: { bold: true, color: "#0B3B75" }, horizontalAlignment: "center" };
dash.getRange("A7:L7").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
dash.getRange("A13:J13").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center" };
dash.getRange("L13:Q13").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center" };
for (const sheet of [control, fuentes, raw, config]) {
  sheet.getRange("A1:Z1").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", wrapText: true };
}
fuentes.getRange("H1:M1").format = { fill: "#0F5E4D", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center" };

dash.getRange("A:Q").format.columnWidthPx = 118;
dash.getRange("A:A").format.columnWidthPx = 145;
dash.getRange("F:F").format.columnWidthPx = 150;
control.getRange("A:J").format.columnWidthPx = 125;
fuentes.getRange("A:M").format.columnWidthPx = 125;
raw.getRange("A:S").format.columnWidthPx = 120;
raw.getRange("L:L").format.columnWidthPx = 210;
config.getRange("A:D").format.columnWidthPx = 180;

for (const range of ["A8:A9", "B9:B9", "G8:G9", "I14:I40", "B14:B40", "M14:M16", "C:C", "D:D"]) {
  try { dash.getRange(range).format.numberFormat = '"S/ "#,##0.00'; } catch {}
}
dash.getRange("A8:A8").format.numberFormat = '"S/ "#,##0.00';
dash.getRange("F8:F8").format.numberFormat = '"S/ "#,##0.00';
dash.getRange("G8:G8").format.numberFormat = '"S/ "#,##0.00';
dash.getRange("H8:H8").format.numberFormat = "0.0%";
dash.getRange("L8:L8").format.numberFormat = "0.0%";
dash.getRange("B14:B40").format.numberFormat = '"S/ "#,##0.00';
dash.getRange("I14:I40").format.numberFormat = '"S/ "#,##0.00';
dash.getRange("J14:J40").format.numberFormat = "0.0%";
dash.getRange("M14:M20").format.numberFormat = '"S/ "#,##0.00';
dash.getRange("Q14:Q20").format.numberFormat = "0.0%";
control.getRange("C:C").format.numberFormat = '"S/ "#,##0.00';
control.getRange("J:J").format.numberFormat = '"S/ "#,##0.00';
fuentes.getRange("D:D").format.numberFormat = '"S/ "#,##0.00';
fuentes.getRange("K:K").format.numberFormat = '"S/ "#,##0.00';
raw.getRange("O:Q").format.numberFormat = '"S/ "#,##0.00';

dash.freezePanes.freezeRows(7);
control.freezePanes.freezeRows(1);
fuentes.freezePanes.freezeRows(1);
raw.freezePanes.freezeRows(1);

dash.charts.add("ColumnClustered", {
  title: "Venta mensual 3 sedes",
  categories: monthTotals.map((m) => m.Mes),
  series: [{ name: "Venta", values: monthTotals.map((m) => m.Venta) }],
  hasLegend: false,
  from: { row: 31, col: 0 },
  extent: { widthPx: 680, heightPx: 300 },
});
dash.charts.add("line", {
  title: "Nuevos vs activos por mes",
  categories: monthTotals.map((m) => m.Mes),
  series: [
    { name: "Nuevos", values: monthTotals.map((m) => m.Nuevos) },
    { name: "Activos", values: monthTotals.map((m) => m.Activos) },
  ],
  hasLegend: true,
  from: { row: 31, col: 7 },
  extent: { widthPx: 560, heightPx: 300 },
});
fuentes.charts.add("bar", {
  title: "Top origenes / leads por venta",
  categories: sourceTop.slice(0, 10).map((r) => `${r[2]} | ${r[0].replace("Trim ", "T")}`),
  series: [{ name: "Venta", values: sourceTop.slice(0, 10).map((r) => r[3]) }],
  hasLegend: false,
  from: { row: 2, col: 14 },
  extent: { widthPx: 600, heightPx: 320 },
});

console.log((await workbook.inspect({ kind: "table", range: "Dashboard!A7:L10", include: "values,formulas", tableMaxRows: 4, tableMaxCols: 12 })).ndjson);
console.log((await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 } })).ndjson);
await workbook.render({ sheetName: "Dashboard", range: "A1:Q45", scale: 1 });
await workbook.render({ sheetName: "Control mensual", range: "A1:J25", scale: 1 });
await workbook.render({ sheetName: "Fuentes leads", range: "A1:U28", scale: 1 });

await fs.mkdir(outDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outPath);
console.log(outPath);
