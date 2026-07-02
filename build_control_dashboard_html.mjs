import fs from "node:fs/promises";
import path from "node:path";

const controlData = JSON.parse(await fs.readFile("outputs/control_dashboard/control_data.json", "utf8"));
let metricsData = { Clientes: [], Compras: [] };
try {
  metricsData = JSON.parse(await fs.readFile("outputs/metricas_3_sedes/base_metricas_data.json", "utf8"));
} catch {}

const outPath = path.resolve("outputs/control_dashboard/tablero_control_trim_gym.html");

function escJson(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Trim Gym | Dashboard Comercial</title>
  <style>
    :root {
      --bg: #f4f1ec;
      --panel: #ffffff;
      --ink: #111111;
      --muted: #706a62;
      --line: #ddd6cc;
      --blue: #111111;
      --navy: #191919;
      --teal: #987447;
      --green: #1f8a4c;
      --amber: #b77900;
      --red: #df1119;
      --violet: #5d4b3f;
      --cream: #fffaf2;
      --shadow: 0 18px 42px rgba(18, 18, 18, .10);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      color: var(--ink);
      background:
        linear-gradient(180deg, #111 0, #111 88px, transparent 88px),
        radial-gradient(circle at 12% 0%, rgba(223,17,25,.12), transparent 30%),
        var(--bg);
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(17, 17, 17, .96);
      border-bottom: 1px solid rgba(255,255,255,.12);
      padding: 18px 28px 16px;
      backdrop-filter: blur(8px);
    }
    .brand-kicker {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: #fff;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    .brand-kicker::before {
      content: "";
      width: 28px;
      height: 28px;
      border: 5px solid var(--red);
      border-radius: 50%;
      box-shadow: inset 0 0 0 5px #111;
      background: var(--red);
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 18px;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.12;
      letter-spacing: 0;
      color: #fff;
    }
    .sub {
      margin-top: 5px;
      color: #c9c2b8;
      font-size: 13px;
    }
    .badge {
      padding: 8px 11px;
      border-radius: 7px;
      background: rgba(223,17,25,.14);
      color: #fff;
      border: 1px solid rgba(223,17,25,.65);
      font-weight: 800;
      font-size: 12px;
      white-space: nowrap;
    }
    .filters {
      display: grid;
      grid-template-columns: repeat(7, minmax(130px, 1fr));
      gap: 10px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    select, input {
      width: 100%;
      height: 38px;
      border: 1px solid #c8d2df;
      border-radius: 7px;
      padding: 0 10px;
      font: inherit;
      font-size: 13px;
      color: var(--ink);
      background: #fffaf2;
      outline: none;
    }
    select:focus, input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(223,17,25,.14); }
    main { padding: 22px 28px 38px; }
    .brand-summary {
      display: grid;
      grid-template-columns: 1.3fr repeat(3, minmax(150px, .7fr));
      gap: 12px;
      margin-bottom: 14px;
    }
    .brand-statement {
      background: #111;
      color: #fff;
      border-radius: 8px;
      padding: 18px;
      border: 1px solid #2b2b2b;
      box-shadow: var(--shadow);
      min-height: 112px;
    }
    .brand-statement b {
      display: block;
      color: var(--red);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .12em;
      margin-bottom: 8px;
    }
    .brand-statement strong {
      display: block;
      font-size: 24px;
      line-height: 1.1;
      max-width: 760px;
    }
    .summary-chip {
      border-radius: 8px;
      background: #fff;
      border: 1px solid var(--line);
      padding: 16px;
      box-shadow: var(--shadow);
    }
    .summary-chip b {
      display: block;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 8px;
    }
    .summary-chip strong {
      display: block;
      color: #111;
      font-size: 23px;
      line-height: 1;
    }
    .summary-chip span { display: block; margin-top: 7px; color: var(--muted); font-size: 12px; }
    .hero {
      display: grid;
      grid-template-columns: 1.2fr .8fr;
      gap: 14px;
      margin-bottom: 14px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 17px;
      min-width: 0;
    }
    .panel-title {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 12px;
    }
    h2 {
      margin: 0;
      font-size: 16px;
      line-height: 1.2;
    }
    .hint { color: var(--muted); font-size: 12px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(130px, 1fr));
      gap: 10px;
    }
    .kpi {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: linear-gradient(180deg, #fff 0%, #fffaf2 100%);
      min-height: 96px;
      position: relative;
      overflow: hidden;
    }
    .kpi::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: var(--red);
    }
    .kpi b {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 8px;
    }
    .kpi strong {
      display: block;
      font-size: 25px;
      line-height: 1;
      letter-spacing: 0;
    }
    .kpi span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-top: 8px;
    }
    .delta-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .delta {
      border-radius: 999px;
      padding: 3px 7px;
      font-size: 11px;
      font-weight: 850;
      background: #f0ebe4;
      color: #475569;
    }
    .delta.up { color: #0b6b3a; background: #dcf8e8; }
    .delta.down { color: #9a2f2f; background: #ffe4e4; }
    .split {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-top: 12px;
    }
    .flow-card {
      margin-top: 10px;
      border: 1px solid #e1d5c4;
      border-radius: 8px;
      padding: 13px;
      background: #fff8ea;
      display: grid;
      grid-template-columns: 1.1fr repeat(3, minmax(110px, .7fr));
      gap: 10px;
      align-items: center;
    }
    .flow-card .flow-title {
      font-weight: 900;
      font-size: 14px;
      color: #111;
    }
    .flow-card .flow-sub {
      color: var(--muted);
      font-size: 12px;
      margin-top: 4px;
    }
    .flow-metric {
      border-left: 1px solid #e1d5c4;
      padding-left: 10px;
    }
    .flow-metric b {
      display: block;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .04em;
      margin-bottom: 5px;
    }
    .flow-metric strong {
      display: block;
      font-size: 20px;
      line-height: 1;
    }
    .flow-metric .positive { color: #0b6b3a; }
    .flow-metric .negative { color: #9a2f2f; }
    .split-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fffaf2;
    }
    .split-card b { display: block; color: var(--muted); font-size: 12px; }
    .split-card strong { display: block; margin-top: 8px; font-size: 22px; }
    .split-card span { display: block; margin-top: 6px; color: var(--muted); font-size: 12px; }
    .counterfactual-card {
      grid-column: 1 / -1;
      border: 1px solid rgba(223,17,25,.22);
      border-radius: 10px;
      padding: 16px;
      background:
        linear-gradient(135deg, rgba(17,17,17,.97), rgba(51,27,27,.94)),
        #111;
      color: #fff;
      display: grid;
      grid-template-columns: 1fr repeat(3, minmax(120px, .55fr));
      gap: 14px;
      align-items: center;
      box-shadow: 0 18px 40px rgba(17,17,17,.16);
    }
    .counterfactual-card b {
      display: block;
      color: #ffb9b9;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 7px;
    }
    .counterfactual-card strong {
      display: block;
      font-size: 26px;
      line-height: 1;
      color: #fff;
    }
    .counterfactual-card span {
      display: block;
      color: rgba(255,255,255,.72);
      font-size: 12px;
      line-height: 1.35;
      margin-top: 7px;
    }
    .counterfactual-title strong { font-size: 19px; line-height: 1.1; }
    .counterfactual-loss strong { color: #ffdbdb; }
    .pipeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .stage {
      border-radius: 8px;
      padding: 10px;
      color: #fff;
      min-height: 82px;
      min-width: 0;
      width: min(760px, 100%);
      text-align: center;
      position: relative;
      box-shadow: 0 10px 22px rgba(15, 23, 42, .12);
    }
    .stage::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -10px;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid rgba(23, 32, 51, .22);
    }
    .stage:last-child::after { display: none; }
    .stage:nth-child(1) { background: #111; }
    .stage:nth-child(2) { background: var(--red); }
    .stage:nth-child(3) { background: var(--green); }
    .stage:nth-child(4) { background: var(--amber); }
    .stage:nth-child(5) { background: var(--red); }
    .stage:nth-child(2) { width: min(680px, 92%); }
    .stage:nth-child(3) { width: min(600px, 84%); }
    .stage:nth-child(4) { width: min(520px, 76%); }
    .stage:nth-child(5) { width: min(440px, 68%); }
    .stage b { display: block; font-size: 12px; opacity: .9; }
    .stage strong { display: block; font-size: 22px; margin-top: 7px; }
    .stage span { display: block; font-size: 11px; margin-top: 6px; opacity: .9; }
    .impact-summary {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .impact-card {
      border: 1px solid #e1d5c4;
      background: #fffaf2;
      border-radius: 8px;
      padding: 12px;
      min-width: 0;
    }
    .impact-card b { display: block; color: var(--muted); font-size: 12px; }
    .impact-card strong { display: block; margin-top: 7px; font-size: 22px; color: #111; }
    .impact-card span { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; line-height: 1.35; }
    .method-note {
      margin-top: 10px;
      border-left: 4px solid var(--red);
      padding: 10px 12px;
      background: #fff8ea;
      color: #334155;
      font-size: 12px;
      line-height: 1.45;
    }
    .charts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }
    .chart-box { height: 330px; }
    .wide > .chart-box:not(.pipeline-box) { height: 390px; }
    .chart-box.pipeline-box { height: 720px; }
    canvas { width: 100%; height: 100%; display: block; }
    .wide { grid-column: 1 / -1; }
    .tables {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .table-panel { padding: 0; overflow: hidden; }
    .table-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid var(--line);
      background: #fffaf2;
    }
    .table-scroll { max-height: 470px; overflow: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 920px;
      font-size: 12px;
    }
    th, td {
      padding: 9px 10px;
      border-bottom: 1px solid #e9edf3;
      text-align: left;
      white-space: nowrap;
    }
    th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #111;
      color: #fff;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .num { text-align: right; }
    .pill {
      display: inline-flex;
      align-items: center;
      height: 22px;
      border-radius: 999px;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 850;
    }
    .ok { color: #0b6b3a; background: #dff8e9; }
    .bad { color: #9a2f2f; background: #ffe4e4; }
    .yes { color: #0b4f7a; background: #e0f2ff; }
    .dashboard-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: 18px;
      padding: 22px 28px 38px;
      align-items: start;
    }
    .dashboard-main { min-width: 0; }
    .client360 {
      position: sticky;
      top: 104px;
      min-height: calc(100vh - 128px);
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(255, 250, 242, .94);
      box-shadow: var(--shadow);
      padding: 20px;
    }
    .client360-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .client360 h2 { font-size: 22px; }
    .client-close {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--line);
      display: grid;
      place-items: center;
      font-weight: 900;
    }
    .client-profile {
      display: grid;
      grid-template-columns: 58px 1fr;
      gap: 12px;
      align-items: center;
      margin-bottom: 18px;
    }
    .client-avatar {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #111;
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 20px;
      font-weight: 900;
      box-shadow: 0 12px 22px rgba(0,0,0,.18);
    }
    .client-name { font-size: 16px; font-weight: 900; }
    .client-source { margin-top: 4px; color: var(--muted); font-size: 12px; }
    .client-stat-list {
      display: grid;
      gap: 10px;
      padding: 14px 0;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    .client-stat {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
    }
    .client-stat b { color: var(--muted); }
    .client-stat strong { text-align: right; }
    .purchase-list {
      margin-top: 16px;
      display: grid;
      gap: 10px;
    }
    .purchase-item {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      padding: 10px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      font-size: 12px;
    }
    .purchase-item b { display: block; font-size: 12px; }
    .purchase-item span { display: block; color: var(--muted); margin-top: 3px; }
    .sede-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }
    .sede-card {
      border: 1px solid var(--line);
      border-top: 3px solid var(--green);
      border-radius: 8px;
      background: #fff;
      box-shadow: var(--shadow);
      padding: 14px;
    }
    .sede-card:nth-child(2) { border-top-color: var(--amber); }
    .sede-card:nth-child(3) { border-top-color: var(--red); }
    .sede-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      gap: 8px;
    }
    .sede-card h3 {
      margin: 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    .sede-badge {
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 850;
      background: #dcf8e8;
      color: #0b6b3a;
    }
    .sede-card:nth-child(2) .sede-badge { background: #fff2cf; color: #8a5800; }
    .sede-card:nth-child(3) .sede-badge { background: #ffe4e4; color: #9a2f2f; }
    .sede-main {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .sede-main b,
    .sede-foot b { display: block; color: var(--muted); font-size: 11px; margin-bottom: 4px; }
    .sede-main strong { display: block; font-size: 18px; }
    .sede-foot {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      font-size: 12px;
    }
    .explorer-tools {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mini-button {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 7px;
      height: 32px;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 800;
      color: #111;
    }
    .kpi {
      padding: 16px 54px 14px 16px;
      min-height: 110px;
    }
    .kpi::after {
      content: "";
      position: absolute;
      right: 16px;
      top: 28px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 50%, #fff 0 36%, rgba(223,17,25,.14) 38% 100%);
      border: 1px solid rgba(223,17,25,.18);
    }
    .kpi:nth-child(1)::after { content: "↗"; color: var(--red); display: grid; place-items: center; font-weight: 900; }
    .kpi:nth-child(2)::after { content: "◎"; color: var(--red); display: grid; place-items: center; font-weight: 900; }
    .kpi:nth-child(3)::after { content: "∑"; color: var(--red); display: grid; place-items: center; font-weight: 900; }
    .kpi:nth-child(4)::after { content: "●"; color: var(--red); display: grid; place-items: center; font-weight: 900; }
    .kpi strong { font-size: 31px; }
    .panel {
      border-radius: 10px;
    }
    .brand-summary { display: none; }
    main { padding: 0; }
    @media (max-width: 1160px) {
      .dashboard-shell { grid-template-columns: 1fr; }
      .client360 { position: static; min-height: auto; }
      .sede-cards { grid-template-columns: 1fr; }
      .brand-summary { grid-template-columns: 1fr 1fr; }
      .filters { grid-template-columns: repeat(3, minmax(150px, 1fr)); }
      .hero, .charts { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: repeat(2, minmax(130px, 1fr)); }
      .flow-card { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 720px) {
      header, main { padding-left: 14px; padding-right: 14px; }
      .topbar { flex-direction: column; align-items: flex-start; }
      .brand-summary { grid-template-columns: 1fr; }
      .filters, .kpi-grid, .pipeline { grid-template-columns: 1fr; }
      .impact-summary { grid-template-columns: 1fr; }
      .counterfactual-card { grid-template-columns: 1fr; }
      .flow-card { grid-template-columns: 1fr; }
      h1 { font-size: 21px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="topbar">
      <div>
        <div class="brand-kicker">TRIM GYM BOUTIQUE</div>
        <h1>Trim Gym | Tablero Comercial</h1>
        <div class="sub">Venta total, venta atribuida, pipeline de clientes generados y avance mensual</div>
      </div>
      <div class="badge">Corte 30/06/2026</div>
    </div>
      <div class="filters">
        <div><label>Sede</label><select id="sede"></select></div>
        <div><label>Año</label><select id="year"></select></div>
        <div><label>Mes</label><select id="mes"></select></div>
        <div><label>Origen / Lead</label><select id="origen"></select></div>
        <div><label>Tipo plan</label><select id="plan"></select></div>
        <div><label>Llama Leads</label><select id="llama"></select></div>
        <div><label>Matrícula</label><select id="matricula"></select></div>
        <div><label>Buscar cliente</label><input id="buscar" placeholder="Nombre, DNI o celular"></div>
      </div>
  </header>
  <main class="dashboard-shell">
    <div class="dashboard-main">
    <section class="brand-summary">
      <div class="brand-statement">
        <b>Trim Gym Boutique x Llama Leads</b>
        <strong>Fuerza comercial, recompra y venta atribuida en un solo tablero ejecutivo.</strong>
      </div>
      <div class="summary-chip">
        <b>Venta junio 3 sedes</b>
        <strong>S/ 272,326</strong>
        <span>corte 30/06/2026</span>
      </div>
      <div class="summary-chip">
        <b>Impacto Llama junio</b>
        <strong>S/ 62,757</strong>
        <span>nuevos + matrícula + ajustes</span>
      </div>
      <div class="summary-chip">
        <b>Retorno junio</b>
        <strong>7.6x</strong>
        <span>vs pauta + servicio</span>
      </div>
    </section>
    <section class="hero">
      <div class="panel">
        <div class="panel-title"><h2>Indicadores del filtro</h2><span class="hint" id="filterLabel"></span></div>
        <div class="kpi-grid" id="kpis"></div>
        <div class="split" id="salesSplit"></div>
        <div id="flowCard"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Pipeline comercial por sede</h2><span class="hint">leads a cierres</span></div>
        <div class="pipeline" id="pipeline"></div>
        <div id="impactSummary"></div>
      </div>
    </section>
    <section class="charts">
      <div class="panel wide">
        <div class="panel-title"><h2>Impacto real Llama Leads mes a mes</h2><span class="hint">monto generado por clientes de la agencia</span></div>
        <div class="chart-box"><canvas id="attribChart"></canvas></div>
      </div>
      <div class="panel wide">
        <div class="panel-title"><h2>Facturación total mes a mes</h2><span class="hint">nuevos, renovaciones, reinscripciones y matrículas</span></div>
        <div class="chart-box"><canvas id="salesChart"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Venta por origen / lead</h2><span class="hint">top canales del filtro</span></div>
        <div class="chart-box"><canvas id="sourceChart"></canvas></div>
      </div>
      <div class="panel wide">
        <div class="panel-title"><h2>Pipeline comercial visual</h2><span class="hint" id="pipelineFilterLabel">Todas las sedes</span></div>
        <div class="chart-box pipeline-box"><canvas id="pipelineChart"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Mix de venta por tipo de plan</h2><span class="hint">en soles</span></div>
        <div class="chart-box"><canvas id="planChart"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Peso PT vs Semi mes a mes</h2><span class="hint">% sobre ventas PT+Semi</span></div>
        <div class="chart-box"><canvas id="programMixChart"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Conversión Trim Intro</h2><span class="hint">paso posterior a PT o Semi</span></div>
        <div class="chart-box"><canvas id="introConversionChart"></canvas></div>
      </div>
    </section>
    <section class="sede-cards" id="sedeCards"></section>
    <section class="tables">
      <div class="panel table-panel">
        <div class="table-head"><h2>Progreso mensual</h2><span class="hint" id="monthCount"></span></div>
        <div class="table-scroll"><table id="monthTable"></table></div>
      </div>
      <div class="panel table-panel">
        <div class="table-head"><h2>Explorador de clientes</h2><div class="explorer-tools"><span class="hint" id="attribRankCount"></span><button class="mini-button" id="exportClients" type="button">Exportar CSV</button></div></div>
        <div class="table-scroll"><table id="attribRankTable"></table></div>
      </div>
      <div class="panel table-panel">
        <div class="table-head"><h2>Validación histórica 2025</h2><span class="hint" id="historicalCount"></span></div>
        <div class="table-scroll"><table id="historicalTable"></table></div>
      </div>
      <div class="panel table-panel">
        <div class="table-head"><h2>Detalle de ventas</h2><span class="hint" id="rowCount"></span></div>
        <div class="table-scroll"><table id="salesTable"></table></div>
      </div>
    </section>
    </div>
    <aside class="client360" id="client360"></aside>
  </main>
  <script>
    const DATA = ${escJson(controlData)};
    const METRICS = ${escJson(metricsData)};
    const ventas = DATA.ventas || [];
    const money = v => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(v || 0).replace('PEN', 'S/');
    const money2 = v => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(v || 0).replace('PEN', 'S/');
    const pct = v => new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 }).format(v || 0);
    const norm = s => String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
    const leadScore = (lead, client) => {
      const a = norm(lead).replace(/[^a-z0-9 ]/g, ' ').split(/\\s+/).filter(Boolean);
      const b = new Set(norm(client).replace(/[^a-z0-9 ]/g, ' ').split(/\\s+/).filter(Boolean));
      if (!a.length || !b.size) return 0;
      return a.filter(t => b.has(t)).length / a.length;
    };
    const uniq = arr => [...new Set(arr.filter(v => v !== undefined && v !== null && String(v).trim() !== ''))];
    const colors = ['#2468d8', '#0f8b83', '#1f8a4c', '#b77900', '#c44545', '#6951b8', '#526173'];
    const els = {
      sede: document.querySelector('#sede'),
      year: document.querySelector('#year'),
      mes: document.querySelector('#mes'),
      origen: document.querySelector('#origen'),
      plan: document.querySelector('#plan'),
      llama: document.querySelector('#llama'),
      matricula: document.querySelector('#matricula'),
      buscar: document.querySelector('#buscar')
    };
    const monthNames = { '01':'Enero', '02':'Febrero', '03':'Marzo', '04':'Abril', '05':'Mayo', '06':'Junio', '07':'Julio', '08':'Agosto', '09':'Septiembre', '10':'Octubre', '11':'Noviembre', '12':'Diciembre' };
    const monthOptions = ['Todos', ...Object.entries(monthNames).map(([num, name]) => num + ' - ' + name)];
    const captureMonthMap = {'Octubre 2025':'2025-10','Noviembre 2025':'2025-11','Diciembre 2025':'2025-12','Enero 2026':'2026-01','Febrero 2026':'2026-02','Marzo 2026':'2026-03','Abril 2026':'2026-04','Mayo 2026':'2026-05','Junio 2026':'2026-06'};
    const captureMonthLabel = key => {
      const [year, month] = String(key || '').split('-');
      return monthNames[month] && year ? monthNames[month] + ' ' + year : '';
    };
    const historicalLeadSources2025 = ['Form free trial', 'Free trial', 'Referido lead', 'Form meta', 'Web', 'Instagram'];
    const lists = {
      sede: ['Todos', ...uniq(ventas.map(r => r.Sede)).sort()],
      year: ['Todos', ...uniq(ventas.map(r => String(r.Mes || '').slice(0, 4))).sort()],
      mes: monthOptions,
      origen: ['Todos', ...uniq([...ventas.map(r => r.Origen), ...historicalLeadSources2025, 'Matrícula atribuida', 'Ajuste Trim Intro']).sort()],
      plan: ['Todos', ...uniq(ventas.map(r => r['Tipo plan'])).sort()],
      llama: ['Todos', 'Solo Llama Leads', 'Sin Llama Leads'],
      matricula: ['Con matrícula', 'Solo nuevos + matrículas', 'Sin matrícula', 'Solo matrícula']
    };
    for (const key of ['sede', 'year', 'mes', 'origen', 'plan', 'llama', 'matricula']) {
      els[key].innerHTML = lists[key].map(v => '<option>' + escapeHtml(v) + '</option>').join('');
    }
    function monthFromCapture(label) {
      return captureMonthMap[label] || '';
    }
    const historicalMatchCache = new Map();
    function historicalLeadForRow(row) {
      const cacheKey = [row.Sede, row.Cliente || row['Cliente Excel'] || row['Cliente captura'] || '', row.DNI || ''].join('|');
      if (historicalMatchCache.has(cacheKey)) return historicalMatchCache.get(cacheKey);
      const client = row.Cliente || row['Cliente Excel'] || row['Cliente captura'] || '';
      const n = norm(client);
      let best = null;
      for (const lead of historicalLeads2025) {
        const ln = norm(lead.name);
        const contains = n.includes(ln);
        const sc = leadScore(lead.name, client);
        if (contains || sc >= 0.75) {
          const candidate = { ...lead, matchType: contains ? 'Exacto/contiene' : 'Posible tokens', score: contains ? 1 : sc };
          if (!best || candidate.score > best.score) best = candidate;
        }
      }
      historicalMatchCache.set(cacheKey, best);
      return best;
    }
    function isPtGenerated(row) {
      const key = row.Sede + '|' + row['Cliente captura'];
      const pt = new Set([
        'Trim 1 - Mendiburu|Natalia Barreda',
        'Trim 1 - Mendiburu|Stefanie Kronenberg',
        'Trim 1 - Mendiburu|Walter de la Torre',
        'Trim 1 - Mendiburu|Mathias Brivio',
        'Trim 1 - Mendiburu|Fernando Chocano',
        'Trim 1 - Mendiburu|Jose Espinoza',
        'Trim 2 - Balboa|Patricia Barreto',
        'Trim 2 - Balboa|Marite Saavedra',
        'Trim 3 - Benavides|Matias Schreyer',
        'Trim 3 - Benavides|Orissa Alvear',
        'Trim 3 - Benavides|Beatriz de la Puente',
        'Trim 3 - Benavides|Carolina Quino',
        'Trim 3 - Benavides|Jimena Chocano'
      ]);
      return pt.has(key);
    }
    const acquisitionTargets = {
      'Trim 1 - Mendiburu|2026-01': 6443,
      'Trim 2 - Balboa|2026-01': 3913,
      'Trim 3 - Benavides|2026-01': 10920,
      'Trim 1 - Mendiburu|2026-02': 5311,
      'Trim 2 - Balboa|2026-02': 5290,
      'Trim 3 - Benavides|2026-02': 12756,
      'Trim 1 - Mendiburu|2026-03': 7440,
      'Trim 2 - Balboa|2026-03': 8706,
      'Trim 3 - Benavides|2026-03': 18562,
      'Trim 1 - Mendiburu|2026-04': 17818,
      'Trim 2 - Balboa|2026-04': 2618,
      'Trim 3 - Benavides|2026-04': 13184,
      'Trim 1 - Mendiburu|2026-05': 13554,
      'Trim 2 - Balboa|2026-05': 5700,
      'Trim 3 - Benavides|2026-05': 17446,
      'Trim 1 - Mendiburu|2026-06': 11618,
      'Trim 2 - Balboa|2026-06': 18343,
      'Trim 3 - Benavides|2026-06': 24696
    };
    const acquisitionMatriculaTargets = {
      'Trim 1 - Mendiburu|2026-01': 1197,
      'Trim 2 - Balboa|2026-01': 1197,
      'Trim 3 - Benavides|2026-01': 1995,
      'Trim 1 - Mendiburu|2026-02': 1596,
      'Trim 2 - Balboa|2026-02': 1995,
      'Trim 3 - Benavides|2026-02': 2793,
      'Trim 1 - Mendiburu|2026-03': 1995,
      'Trim 2 - Balboa|2026-03': 3192,
      'Trim 3 - Benavides|2026-03': 5586,
      'Trim 1 - Mendiburu|2026-04': 399,
      'Trim 2 - Balboa|2026-04': 399,
      'Trim 3 - Benavides|2026-04': 1197,
      'Trim 1 - Mendiburu|2026-05': 1197,
      'Trim 2 - Balboa|2026-05': 0,
      'Trim 3 - Benavides|2026-05': 798,
      'Trim 1 - Mendiburu|2026-06': 399,
      'Trim 2 - Balboa|2026-06': 1197,
      'Trim 3 - Benavides|2026-06': 798
    };
    const countedIntroGapTargets = {
      'Trim 1 - Mendiburu|2026-04': 7200,
      'Trim 1 - Mendiburu|2026-05': 2700,
      'Trim 1 - Mendiburu|2026-06': 8100
    };
    const introGapAlreadyInTarget = new Set([
      'Trim 1 - Mendiburu|2026-04',
      'Trim 1 - Mendiburu|2026-05'
    ]);
    const leadPipelineBySede = {
      'Trim 1 - Mendiburu': {
        spend: 1040,
        stages: [
          { label: 'Nuevos leads', value: 137, cp: 7.59 },
          { label: 'Formulario', value: 109, cp: 9.54 },
          { label: 'Citas agendadas', value: 28, cp: 37.13 },
          { label: 'Citas asistidas', value: 25, cp: 41.58 },
          { label: 'Cierres', value: 10, cp: 103.96 }
        ]
      },
      'Trim 2 - Balboa': {
        spend: 1395,
        stages: [
          { label: 'Nuevos leads', value: 166, cp: 8.40 },
          { label: 'Formulario', value: 109, cp: 12.80 },
          { label: 'Citas agendadas', value: 33, cp: 42.27 },
          { label: 'Citas asistidas', value: 25, cp: 55.80 },
          { label: 'Cierres', value: 9, cp: 154.99 }
        ]
      },
      'Trim 3 - Benavides': {
        spend: 1421,
        stages: [
          { label: 'Nuevos leads', value: 189, cp: 7.52 },
          { label: 'Formulario', value: 132, cp: 10.76 },
          { label: 'Citas agendadas', value: 36, cp: 39.47 },
          { label: 'Citas asistidas', value: 30, cp: 47.36 },
          { label: 'Cierres', value: 13, cp: 109.30 }
        ]
      }
    };
    const introAdjustmentTargets = {
      'Trim 1 - Mendiburu|2026-04': 7200,
      'Trim 1 - Mendiburu|2026-05': 2700
    };
    const introAdjustmentMeta = { clientes: 11, monto: 9900 };
    const historicalLeads2025 = [
      { date: '2025-10-31', mes: '2025-10', name: 'Stephanie Bernuy', source: 'Form free trial' },
      { date: '2025-11-03', mes: '2025-11', name: 'Analia Yzaga', source: 'Free trial' },
      { date: '2025-11-03', mes: '2025-11', name: 'Alex Meier', source: 'Referido lead' },
      { date: '2025-11-19', mes: '2025-11', name: 'Renatto Minaya', source: 'Free trial' },
      { date: '2025-11-25', mes: '2025-11', name: 'Michelle Belmont', source: 'Form meta' },
      { date: '2025-12-11', mes: '2025-12', name: 'Marianne Guyard', source: 'Web' },
      { date: '2025-12-20', mes: '2025-12', name: 'Silvia Fernandez', source: 'Form meta' },
      { date: '2025-12-23', mes: '2025-12', name: 'Gabriela Marcano', source: 'Instagram' },
      { date: '2025-12-30', mes: '2025-12', name: 'Ricardo Garcia', source: 'Form meta' },
      { date: '2025-12-30', mes: '2025-12', name: 'Marilia Quispe', source: 'Form meta' },
      { date: '2025-10-13', mes: '2025-10', name: 'Caterine Cino', source: 'Web' },
      { date: '2025-10-20', mes: '2025-10', name: 'Gabriela Chaname', source: 'Web' },
      { date: '2025-10-21', mes: '2025-10', name: 'Gretel Febres', source: 'Instagram' },
      { date: '2025-10-27', mes: '2025-10', name: 'Bruno Porras', source: 'Instagram' },
      { date: '2025-11-07', mes: '2025-11', name: 'Renzo Herrera', source: 'Web' },
      { date: '2025-12-05', mes: '2025-12', name: 'Eugenia Alvarez', source: 'Form meta' },
      { date: '2025-12-15', mes: '2025-12', name: 'Pia Bazurto', source: 'Web' },
      { date: '2025-12-26', mes: '2025-12', name: 'Sehyeon Regina Kim', source: 'Web' },
      { date: '2025-12-30', mes: '2025-12', name: 'Rafael Cabrera', source: 'Free trial' },
      { date: '2025-10-06', mes: '2025-10', name: 'Gonzalo Carbajal', source: 'Web' },
      { date: '2025-10-20', mes: '2025-10', name: 'Geraldine Coronado', source: 'Instagram' },
      { date: '2025-12-02', mes: '2025-12', name: 'Nestor Martos', source: 'Form meta' },
      { date: '2025-12-18', mes: '2025-12', name: 'Geraldine Cano', source: 'Web' },
      { date: '2025-12-26', mes: '2025-12', name: 'Evelyn Juarez', source: 'Web' },
      { date: '2025-12-29', mes: '2025-12', name: 'Carlos Loayza', source: 'Web' },
      { date: '2025-12-31', mes: '2025-12', name: 'Sandra Guzman', source: 'Web' }
    ];
    const introAdjustmentRows = [
      ['Trim 1 - Mendiburu','2026-04','Jocelyne Jurado','43120256'],
      ['Trim 1 - Mendiburu','2026-04','Geraldine Caycho','48088486'],
      ['Trim 1 - Mendiburu','2026-04','Silvia Canales','45589084'],
      ['Trim 1 - Mendiburu','2026-04','Julian Cuadros','73035854'],
      ['Trim 1 - Mendiburu','2026-04','Oscar Dufour','09394682'],
      ['Trim 1 - Mendiburu','2026-04','Mariana Viloria','000244077'],
      ['Trim 1 - Mendiburu','2026-04','Romina Chirinos','44079192'],
      ['Trim 1 - Mendiburu','2026-04','Luis Rodriguez','40783552'],
      ['Trim 1 - Mendiburu','2026-05','Javier Bracco Puch','43226753'],
      ['Trim 1 - Mendiburu','2026-05','Fernando Razeto','10223240'],
      ['Trim 1 - Mendiburu','2026-05','Claudia Namizato','10474396']
    ].map(([sede, mes, cliente, dni]) => ({
      Sede: sede,
      Mes: mes,
      Inscripcion: '',
      'Fecha inicio': '',
      'Fecha fin': '',
      'Estado actual': 'Activo',
      'Tipo plan': 'Nuevo',
      Origen: 'Ajuste Trim Intro',
      'Tipo servicio': 'AJUSTE INTRO',
      Tiempo: '',
      Codigo: '',
      Cliente: cliente,
      'Cliente norm': norm(cliente),
      DNI: dni,
      Celular: '',
      Costo: 900,
      Pago: 900,
      Debe: 0,
      Vendedor: 'Agencia',
      'Atribuido agencia': 'Si',
      'Es matricula': 'No',
      'Es ajuste intro': 'Si'
    }));
    const matriculaAudit = { estimadaNoVisible: 23940 };
    function visibleMatriculaPaid(sede, mes) {
      return (METRICS.Compras || []).filter(r => {
        return r.Sede === sede
          && monthFromDateText(r.Inscripcion) === mes
          && norm(r['Tipo servicio']).includes('matr');
      }).reduce((a, r) => a + Number(r.Pago || 0), 0);
    }
    function visibleAcquisitionMatriculaPaid(sede, mes) {
      return (METRICS.Compras || []).filter(r => {
        return r.Sede === sede
          && monthFromDateText(r.Inscripcion) === mes
          && monthFromCapture(r['Mes captura']) === mes
          && norm(r['Tipo servicio']).includes('matr');
      }).reduce((a, r) => a + Number(r.Pago || 0), 0);
    }
    function visibleIntroSplitPaid(sede, mes) {
      return (METRICS.Compras || []).filter(r => {
        return r.Sede === sede
          && monthFromDateText(r.Inscripcion) === mes
          && norm(r['Tipo servicio']).includes('matr')
          && Number(r.Pago || 0) === 900;
      }).reduce((a, r) => a + Number(r.Pago || 0), 0);
    }
    function missingMatriculaTarget(sede, mes, target) {
      return Math.max(0, Number(target || 0) - visibleAcquisitionMatriculaPaid(sede, mes));
    }
    function missingIntroGapTarget(sede, mes, target) {
      return Math.max(0, Number(target || 0) - visibleIntroSplitPaid(sede, mes));
    }
    function syntheticMatriculas() {
      return Object.entries(acquisitionMatriculaTargets).filter(([, value]) => Number(value || 0) > 0).map(([key, value]) => {
        const [sede, mes] = key.split('|');
        const missing = missingMatriculaTarget(sede, mes, value);
        if (!missing) return null;
        return ({
        Sede: sede,
        Mes: mes,
        Inscripcion: '',
        'Fecha inicio': '',
        'Fecha fin': '',
        'Estado actual': 'Activo',
        'Tipo plan': 'Nuevo',
        Origen: 'Matrícula atribuida',
        'Tipo servicio': 'MATRICULA',
        Tiempo: '',
        Codigo: '',
        Cliente: 'Matrícula atribuida ' + sede,
        'Cliente norm': norm('Matrícula atribuida ' + sede + ' ' + mes),
        DNI: '',
        Celular: '',
        Costo: missing,
        Pago: missing,
        Debe: 0,
        Vendedor: 'Agencia',
        'Atribuido agencia': 'Si',
        'Es matricula': 'Si'
      });
      }).filter(Boolean);
    }
    function baseVentas() {
      const realRows = ventas.map(r => {
        const lead = historicalLeadForRow(r);
        return {
          ...r,
          'Es matricula': norm(r['Tipo servicio']).includes('matricula') ? 'Si' : 'No',
          'Lead historico 2025': lead ? 'Si' : 'No',
          'Fecha lead historico': lead?.date || '',
          'Fuente lead historico': lead?.source || '',
          'Match lead historico': lead?.matchType || '',
          'Atribuido agencia': r['Atribuido agencia'] === 'Si' || lead ? 'Si' : 'No'
        };
      });
      if (els.matricula.value === 'Solo nuevos + matrículas') {
        return [
          ...realRows.filter(r => norm(r['Tipo plan']) === 'nuevo' || r['Es matricula'] === 'Si'),
          ...syntheticMatriculas()
        ];
      }
      if (els.matricula.value === 'Sin matrícula') return realRows.filter(r => r['Es matricula'] !== 'Si');
      if (els.matricula.value === 'Solo matrícula') return [...realRows.filter(r => r['Es matricula'] === 'Si'), ...syntheticMatriculas()];
      return [...realRows, ...syntheticMatriculas()];
    }
    function passesLlamaFilter(row) {
      const isLlama = row['Atribuido agencia'] === 'Si';
      if (els.llama.value === 'Solo Llama Leads') return isLlama;
      if (els.llama.value === 'Sin Llama Leads') return !isLlama;
      return true;
    }
    function passesGeneratedLlamaFilter() {
      return els.llama.value !== 'Sin Llama Leads';
    }
    function escapeHtml(v) {
      return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function filteredRows() {
      const q = norm(els.buscar.value);
      return baseVentas().filter(r => {
        if (els.sede.value !== 'Todos' && r.Sede !== els.sede.value) return false;
        if (els.year.value !== 'Todos' && String(r.Mes || '').slice(0, 4) !== els.year.value) return false;
        if (els.mes.value !== 'Todos' && String(r.Mes || '').slice(5, 7) !== els.mes.value.slice(0, 2)) return false;
        if (els.origen.value !== 'Todos' && r.Origen !== els.origen.value && r['Fuente lead historico'] !== els.origen.value) return false;
        if (els.plan.value !== 'Todos' && r['Tipo plan'] !== els.plan.value) return false;
        if (!passesLlamaFilter(r)) return false;
        if (q && !norm([r.Cliente, r.DNI, r.Celular].join(' ')).includes(q)) return false;
        return true;
      });
    }
    function monthFromDateText(value) {
      const m = String(value || '').match(/^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
      return m ? m[3] + '-' + String(m[2]).padStart(2, '0') : '';
    }
    function filteredMetricPurchases() {
      if (els.llama.value === 'Sin Llama Leads') return [];
      const q = norm(els.buscar.value);
      return (METRICS.Compras || []).map(r => ({
        ...r,
        Mes: monthFromDateText(r.Inscripcion),
        Cliente: r['Cliente Excel'] || r['Cliente captura'] || '',
        Pago: Number(r.Pago || 0)
      })).filter(r => {
        if (els.sede.value !== 'Todos' && r.Sede !== els.sede.value) return false;
        if (els.year.value !== 'Todos' && String(r.Mes || '').slice(0, 4) !== els.year.value) return false;
        if (els.mes.value !== 'Todos' && String(r.Mes || '').slice(5, 7) !== els.mes.value.slice(0, 2)) return false;
        if (els.origen.value !== 'Todos' && r.Origen !== els.origen.value && r['Fuente captura'] !== els.origen.value) return false;
        if (els.plan.value !== 'Todos' && r['Tipo plan'] !== els.plan.value) return false;
        if (els.matricula.value === 'Sin matrÃ­cula' && norm(r['Tipo servicio']).includes('matr')) return false;
        if (els.matricula.value === 'Solo matrÃ­cula' && !norm(r['Tipo servicio']).includes('matr')) return false;
        if (q && !norm([r.Cliente, r.DNI, r.Celular].join(' ')).includes(q)) return false;
        return true;
      });
    }
    function group(rows, keyFn, seedFn, stepFn) {
      const map = new Map();
      for (const row of rows) {
        const key = keyFn(row);
        if (!map.has(key)) map.set(key, seedFn(row, key));
        stepFn(map.get(key), row);
      }
      return [...map.values()];
    }
    function dateDMY(v) {
      const m = String(v || '').match(/^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
      return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
    }
    function introConversionMetrics(rows) {
      const cutoff = new Date(2026, 5, 30);
      const isPersonal = r => norm(r['Tipo servicio']).includes('personal');
      const isMemb = r => norm(r['Tipo servicio']).includes('membres');
      const isMat = r => norm(r['Tipo servicio']).includes('matr');
      const isNutri = r => norm(r['Tipo servicio']).includes('nutri');
      const isIntro = r => {
        const pago = Number(r.Pago || 0);
        return isPersonal(r) && (pago === 1900 || pago === 1000 || /15\\s*dias/i.test(String(r.Tiempo || '')));
      };
      const isLaterPt = r => isPersonal(r) && !isIntro(r) && Number(r.Pago || 0) !== 150;
      const byClient = new Map();
      rows.forEach(r => {
        const key = clientKeyFromParts(r.Sede, r.DNI, r.Celular, r.Cliente || r['Cliente Excel'] || r['Cliente captura']);
        if (!byClient.has(key)) byClient.set(key, []);
        byClient.get(key).push(r);
      });
      const clients = [];
      byClient.forEach(list => {
        const sorted = list.slice().sort((a, b) => (dateDMY(a.Inscripcion)?.getTime() || 0) - (dateDMY(b.Inscripcion)?.getTime() || 0));
        const intro = sorted.find(isIntro);
        if (!intro) return;
        const introTs = dateDMY(intro.Inscripcion)?.getTime() || 0;
        const later = sorted.filter(r => (dateDMY(r.Inscripcion)?.getTime() || 0) > introTs && !isMat(r) && !isNutri(r));
        const laterPt = later.filter(isLaterPt);
        const laterSemi = later.filter(isMemb);
        const lastEnd = sorted.reduce((max, r) => {
          const d = dateDMY(r['Fecha fin']);
          return d && d > max ? d : max;
        }, null);
        const converted = laterPt.length > 0 || laterSemi.length > 0;
        const vencido = !!lastEnd && lastEnd < cutoff;
        clients.push({ converted, vencido, laterPt: laterPt.length, laterSemi: laterSemi.length });
      });
      const total = clients.length;
      const converted = clients.filter(c => c.converted).length;
      const fugados = clients.filter(c => !c.converted && c.vencido).length;
      const pending = clients.filter(c => !c.converted && !c.vencido).length;
      const toPt = clients.filter(c => c.laterPt > 0).length;
      const toSemi = clients.filter(c => c.laterSemi > 0).length;
      return { total, converted, fugados, pending, toPt, toSemi };
    }
    function generatedCustomers() {
      const rows = (METRICS.Clientes || []).filter(r => Number(r['Compras total'] || 0) > 0);
      const map = new Map();
      for (const r of rows) {
        const dni = String(r.DNI || '').trim();
        const cel = String(r['Celular Excel'] || '').replace(/\\D/g, '');
        const key = dni ? r.Sede + '|DNI|' + dni : cel.length >= 9 ? r.Sede + '|CEL|' + cel : r.Sede + '|NAME|' + norm(r['Cliente Excel'] || r['Cliente captura']);
        const cur = map.get(key);
        if (!cur || Number(r['Total pagado'] || 0) > Number(cur['Total pagado'] || 0)) map.set(key, r);
      }
      return [...map.values()];
    }
    function clientKeyFromParts(sede, dni, cel, name) {
      const cleanDni = String(dni || '').trim();
      const cleanCel = String(cel || '').replace(/\\D/g, '');
      if (cleanDni) return sede + '|DNI|' + cleanDni;
      if (cleanCel.length >= 9) return sede + '|CEL|' + cleanCel;
      return sede + '|NAME|' + norm(name);
    }
    let captureMonthByClientCache = null;
    function captureMonthByClient() {
      if (captureMonthByClientCache) return captureMonthByClientCache;
      captureMonthByClientCache = new Map();
      for (const r of (METRICS.Clientes || [])) {
        const key = clientKeyFromParts(r.Sede, r.DNI, r['Celular Excel'], r['Cliente Excel'] || r['Cliente captura']);
        if (!captureMonthByClientCache.has(key)) captureMonthByClientCache.set(key, monthFromCapture(r['Mes captura']));
      }
      return captureMonthByClientCache;
    }
    let historicalValidationCache = null;
    function historicalValidationRows() {
      if (historicalValidationCache) return historicalValidationCache;
      historicalValidationCache = historicalLeads2025.map(lead => {
        const rows = ventas.filter(r => historicalLeadForRow(r)?.name === lead.name).sort((a, b) => (dateDMY(a.Inscripcion)?.getTime() || 0) - (dateDMY(b.Inscripcion)?.getTime() || 0));
        const total = rows.reduce((a, r) => a + Number(r.Pago || 0), 0);
        const first = rows[0] || {};
        const last = rows[rows.length - 1] || {};
        return {
          ...lead,
          match: rows.length ? 'Si' : 'No',
          matchType: rows.length ? historicalLeadForRow(first)?.matchType || 'Match' : 'Sin match',
          sede: first.Sede || '',
          clienteExcel: first.Cliente || '',
          dni: first.DNI || '',
          celular: first.Celular || '',
          tx: rows.length,
          total,
          firstPago: Number(first.Pago || 0),
          primeraCompra: first.Inscripcion || '',
          ultimaCompra: last.Inscripcion || '',
          estado: rows.some(r => r['Estado actual'] === 'Activo') ? 'Activo' : rows.length ? 'Churn observado' : 'Sin match'
        };
      });
      return historicalValidationCache;
    }
    function filteredGenerated() {
      const q = norm(els.buscar.value);
      if (!passesGeneratedLlamaFilter()) return [];
      const combined = [];
      for (const r of (METRICS.Clientes || []).filter(r => Number(r['Compras total'] || 0) > 0)) combined.push(r);
      for (const h of historicalValidationRows().filter(r => r.match === 'Si')) {
        combined.push({
          Sede: h.sede,
          'Mes captura': captureMonthLabel(h.mes),
          'Cliente captura': h.name,
          'Fuente captura': h.source,
          'Cliente Excel': h.clienteExcel,
          DNI: h.dni,
          'Celular Excel': h.celular,
          'Compras total': h.tx,
          'Compras posteriores': Math.max(0, h.tx - 1),
          'Total pagado': h.total,
          'Estado a 30/06/2026': h.estado
        });
      }
      const map = new Map();
      for (const r of combined) {
        const key = clientKeyFromParts(r.Sede, r.DNI, r['Celular Excel'], r['Cliente Excel'] || r['Cliente captura']);
        const cur = map.get(key);
        if (!cur || Number(r['Total pagado'] || 0) > Number(cur['Total pagado'] || 0)) map.set(key, r);
      }
      return [...map.values()].filter(r => {
        const mes = monthFromCapture(r['Mes captura']);
        if (els.sede.value !== 'Todos' && r.Sede !== els.sede.value) return false;
        if (els.year.value !== 'Todos' && String(mes || '').slice(0, 4) !== els.year.value) return false;
        if (els.mes.value !== 'Todos' && String(mes || '').slice(5, 7) !== els.mes.value.slice(0, 2)) return false;
        if (els.origen.value !== 'Todos' && r['Fuente captura'] !== els.origen.value) return false;
        if (q && !norm([r['Cliente captura'], r['Cliente Excel'], r.DNI, r['Celular Excel']].join(' ')).includes(q)) return false;
        return true;
      });
    }
    function acquisitionRows(ignorePeriod = false) {
      const q = norm(els.buscar.value);
      if (!passesGeneratedLlamaFilter()) return [];
      const current = (METRICS.Clientes || []).filter(r => Number(r['Compras total'] || 0) > 0).filter(r => {
        const mes = monthFromCapture(r['Mes captura']);
        if (!mes) return false;
        if (els.sede.value !== 'Todos' && r.Sede !== els.sede.value) return false;
        if (!ignorePeriod && els.year.value !== 'Todos' && mes.slice(0, 4) !== els.year.value) return false;
        if (!ignorePeriod && els.mes.value !== 'Todos' && mes.slice(5, 7) !== els.mes.value.slice(0, 2)) return false;
        if (els.origen.value !== 'Todos' && r['Fuente captura'] !== els.origen.value) return false;
        if (q && !norm([r['Cliente captura'], r['Cliente Excel'], r.DNI, r['Celular Excel']].join(' ')).includes(q)) return false;
        return true;
      }).map(r => ({ ...r, Mes: monthFromCapture(r['Mes captura']), Base: Number(r['Monto captura'] || 0) }));
      const historical = historicalValidationRows().filter(r => r.match === 'Si').filter(r => {
        if (els.sede.value !== 'Todos' && r.sede !== els.sede.value) return false;
        if (!ignorePeriod && els.year.value !== 'Todos' && r.mes.slice(0, 4) !== els.year.value) return false;
        if (!ignorePeriod && els.mes.value !== 'Todos' && r.mes.slice(5, 7) !== els.mes.value.slice(0, 2)) return false;
        if (els.origen.value !== 'Todos' && r.source !== els.origen.value) return false;
        if (q && !norm([r.name, r.clienteExcel, r.dni, r.celular].join(' ')).includes(q)) return false;
        return true;
      }).map(r => ({ Sede: r.sede, Mes: r.mes, Base: Number(r.firstPago || 0), 'Fuente captura': r.source, 'Cliente captura': r.name }));
      return [...current, ...historical];
    }
    function introAdjustmentFor(sede, mes, ignorePeriod = false) {
      return 0;
    }
    function acquisitionMonthlyTotals(ignorePeriod = false) {
      const rows = acquisitionRows(ignorePeriod);
      const grouped = group(rows, r => r.Sede + '|' + r.Mes, (r, key) => ({ key, sede: r.Sede, mes: r.Mes, base: 0, target: acquisitionTargets[key] || null, matriculaTarget: acquisitionMatriculaTargets[key] ?? null }), (s, r) => {
        s.base += Number(r.Base || 0);
      });
      return grouped.map(g => {
        const groupKey = g.sede + '|' + g.mes;
        const totalConMatricula = g.target ?? g.base;
        const matriculaVisible = visibleAcquisitionMatriculaPaid(g.sede, g.mes);
        const matriculaFaltante = g.matriculaTarget != null
          ? missingMatriculaTarget(g.sede, g.mes, g.matriculaTarget)
          : (g.target ? Math.max(0, g.target - g.base - matriculaVisible) : 0);
        const matricula = matriculaVisible + matriculaFaltante;
        const ajusteIntro = missingIntroGapTarget(g.sede, g.mes, countedIntroGapTargets[groupKey] || 0);
        const ajusteIntroExtra = introGapAlreadyInTarget.has(groupKey) ? 0 : ajusteIntro;
        const totalAuditado = totalConMatricula + ajusteIntroExtra;
        const nuevos = Math.max(0, totalAuditado - matricula - ajusteIntro);
        if (els.matricula.value === 'Solo matrícula') return { key: g.mes, sede: g.sede, value: matricula, nuevos: 0, matricula };
        if (els.matricula.value === 'Sin matrícula') return { key: g.mes, sede: g.sede, value: nuevos + ajusteIntro, nuevos, matricula: 0, ajusteIntro };
        return { key: g.mes, sede: g.sede, value: totalAuditado, nuevos, matricula, ajusteIntro };
      });
    }
    function acquisitionTotal(ignorePeriod = false, period = null) {
      return acquisitionMonthlyTotals(ignorePeriod)
        .filter(r => !period || r.key === period)
        .reduce((a, r) => a + Number(r.value || 0), 0);
    }
    function countedIntroGapTotal(ignorePeriod = false, period = null) {
      if (!passesGeneratedLlamaFilter()) return 0;
      if (els.matricula.value === 'Solo matrícula') return 0;
      if (els.origen.value !== 'Todos') return 0;
      if (els.plan.value !== 'Todos' && els.plan.value !== 'Nuevo') return 0;
      if (norm(els.buscar.value)) return 0;
      return Object.entries(countedIntroGapTargets).reduce((acc, [key, value]) => {
        const [sede, mes] = key.split('|');
        if (period && mes !== period) return acc;
        if (els.sede.value !== 'Todos' && sede !== els.sede.value) return acc;
        if (!ignorePeriod && els.year.value !== 'Todos' && mes.slice(0, 4) !== els.year.value) return acc;
        if (!ignorePeriod && els.mes.value !== 'Todos' && mes.slice(5, 7) !== els.mes.value.slice(0, 2)) return acc;
        return acc + missingIntroGapTarget(sede, mes, value);
      }, 0);
    }
    function calc(rows) {
      const total = rows.reduce((a, r) => a + Number(r.Pago || 0), 0);
      const tx = rows.length;
      const clients = uniq(rows.map(r => r.Sede + '|' + r['Cliente norm']));
      const active = uniq(rows.filter(r => r['Estado actual'] === 'Activo').map(r => r.Sede + '|' + r['Cliente norm']));
      const newRows = rows.filter(r => norm(r['Tipo plan']) === 'nuevo' && !norm(r['Tipo servicio']).includes('matr')).length;
      const attributed = rows.filter(r => r['Atribuido agencia'] === 'Si').reduce((a, r) => a + Number(r.Pago || 0), 0);
      const newSale = rows.filter(r => norm(r['Tipo plan']) === 'nuevo').reduce((a, r) => a + Number(r.Pago || 0), 0);
      const recurrentSale = rows.filter(r => norm(r['Tipo plan']) !== 'nuevo').reduce((a, r) => a + Number(r.Pago || 0), 0);
      return { total, tx, clients: clients.length, active: active.length, newRows, attributed, newSale, recurrentSale };
    }
    function baseRowsIgnoringPeriod() {
      const q = norm(els.buscar.value);
      return baseVentas().filter(r => {
        if (els.sede.value !== 'Todos' && r.Sede !== els.sede.value) return false;
        if (els.origen.value !== 'Todos' && r.Origen !== els.origen.value && r['Fuente lead historico'] !== els.origen.value) return false;
        if (els.plan.value !== 'Todos' && r['Tipo plan'] !== els.plan.value) return false;
        if (!passesLlamaFilter(r)) return false;
        if (q && !norm([r.Cliente, r.DNI, r.Celular].join(' ')).includes(q)) return false;
        return true;
      });
    }
    function periodKey() {
      const months = uniq(baseRowsIgnoringPeriod().map(r => r.Mes)).sort();
      if (els.year.value !== 'Todos' && els.mes.value !== 'Todos') return els.year.value + '-' + els.mes.value.slice(0, 2);
      if (els.year.value !== 'Todos') {
        const inYear = months.filter(m => m.startsWith(els.year.value + '-'));
        return inYear.at(-1) || months.at(-1) || '';
      }
      if (els.mes.value !== 'Todos') {
        const inMonth = months.filter(m => m.slice(5, 7) === els.mes.value.slice(0, 2));
        return inMonth.at(-1) || months.at(-1) || '';
      }
      return months.at(-1) || '';
    }
    function shiftMonth(key, delta) {
      const [y, m] = key.split('-').map(Number);
      if (!y || !m) return '';
      const d = new Date(y, m - 1 + delta, 1);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }
    function rowsForPeriod(key) {
      return baseRowsIgnoringPeriod().filter(r => r.Mes === key);
    }
    function deltaBadge(current, previous, label) {
      if (!previous) return '<span class="delta">' + label + ': s/d</span>';
      const change = (current - previous) / previous;
      const cls = change >= 0 ? 'up' : 'down';
      const sign = change >= 0 ? '+' : '';
      return '<span class="delta ' + cls + '">' + label + ': ' + sign + pct(change) + '</span>';
    }
    function attributedForPeriod(key) {
      return acquisitionTotal(true, key);
    }
    function renderFlowCard() {
      const pk = periodKey();
      const prevKey = shiftMonth(pk, -1);
      const lastYearKey = shiftMonth(pk, -12);
      const current = attributedForPeriod(pk);
      const previous = attributedForPeriod(prevKey);
      const lastYear = attributedForPeriod(lastYearKey);
      const delta = current - previous;
      const deltaPct = previous ? delta / previous : null;
      const cls = delta >= 0 ? 'positive' : 'negative';
      const sign = delta >= 0 ? '+' : '-';
      const yoyText = lastYear ? (signNumber((current - lastYear) / lastYear)) : 's/d';
      document.querySelector('#flowCard').innerHTML =
        '<div class="flow-card">' +
          '<div><div class="flow-title">Flujo real atribuido</div><div class="flow-sub">Mes de referencia: ' + (pk || 'sin datos') + '</div></div>' +
          '<div class="flow-metric"><b>Valor del flujo</b><strong>' + money(current) + '</strong></div>' +
          '<div class="flow-metric"><b>Incremento vs mes ant.</b><strong class="' + cls + '">' + sign + money(Math.abs(delta)) + '</strong></div>' +
          '<div class="flow-metric"><b>Variacion</b><strong class="' + cls + '">' + (deltaPct === null ? 's/d' : signNumber(deltaPct)) + '</strong></div>' +
          '<div class="flow-metric"><b>Vs año anterior</b><strong>' + yoyText + '</strong></div>' +
        '</div>';
    }
    function signNumber(value) {
      const sign = value >= 0 ? '+' : '';
      return sign + pct(value);
    }
    function pipeline() {
      const rows = filteredGenerated();
      const total = rows.reduce((a, r) => a + Number(r['Total pagado'] || 0), 0);
      const repurchased = rows.filter(r => Number(r['Compras posteriores'] || 0) > 0).length;
      const active = rows.filter(r => r['Estado a 30/06/2026'] === 'Activo').length;
      const churn = rows.filter(r => r['Estado a 30/06/2026'] === 'Churn observado').length;
      const cutoff = new Date(2026, 4, 2);
      const abandoned30 = rows.filter(r => {
        const end = dateDMY(r['Ultima fecha fin']);
        return r['Estado a 30/06/2026'] === 'Churn observado' && end && end < cutoff;
      }).length;
      return { generated: rows.length, total, repurchased, active, churn, abandoned30 };
    }
    function renderImpactSummary(p, matriculaAttrib, ajusteIntro) {
      const introGap = countedIntroGapTotal(false);
      const finalSold = p.total;
      const documentedAdjustments = matriculaAudit.estimadaNoVisible + introGap;
      const correctedImpact = finalSold + documentedAdjustments;
      const adsJune2026 = 3923.69;
      const serviceJune2026 = 4318;
      const investment2026 = adsJune2026 + serviceJune2026;
      const investment2025 = 17850 + 8334.28;
      const investmentJanMay2026 = 16000 + (4300 * 5);
      const investment = investment2025 + investmentJanMay2026 + investment2026;
      const roiRealMultiple = investment ? finalSold / investment : 0;
      const roiAuditedMultiple = investment ? correctedImpact / investment : 0;
      const monthTotals = group(acquisitionMonthlyTotals(true), r => r.key, (r, key) => ({ key, value: 0 }), (s, r) => {
        s.value += Number(r.value || 0);
      }).sort((a, b) => b.value - a.value);
      const best = monthTotals[0] || { key: 's/d', value: 0 };
      const recompras = p.generated ? p.repurchased / p.generated : 0;
      const activeRate = p.generated ? p.active / p.generated : 0;
      document.querySelector('#impactSummary').innerHTML =
        '<div class="impact-summary">' +
          '<div class="impact-card"><b>Venta acumulada real</b><strong>' + money(finalSold) + '</strong><span>Compras reales encontradas en el sistema para clientes generados por Llama Leads, sin sumar ajustes encima.</span></div>' +
          '<div class="impact-card"><b>Ajustes documentados</b><strong>' + money(documentedAdjustments) + '</strong><span>Matrícula no visible + gaps Trim Intro documentados. No incluye doble conteo de matrículas ya registradas.</span></div>' +
          '<div class="impact-card"><b>Impacto total auditado</b><strong>' + money(correctedImpact) + '</strong><span>Venta real en sistema + ajustes documentados auditables.</span></div>' +
          '<div class="impact-card"><b>Mejor mes histórico</b><strong>' + best.key + '</strong><span>' + money(best.value) + ' de venta atribuida corregida.</span></div>' +
          '<div class="impact-card"><b>Inversión junio</b><strong>' + money(investment2026) + '</strong><span>Pauta ' + money(adsJune2026) + ' + servicio ' + money(serviceJune2026) + ' al 30/06 10:37 pm.</span></div>' +
          '<div class="impact-card"><b>Inversión acumulada</b><strong>' + money(investment) + '</strong><span>2025: ' + money(investment2025) + ' | ene-may 2026: ' + money(investmentJanMay2026) + ' | jun 2026: ' + money(investment2026) + '.</span></div>' +
          '<div class="impact-card"><b>Retorno real vs inversión</b><strong>' + roiRealMultiple.toFixed(1).replace('.', ',') + 'x</strong><span>Sobre venta real en sistema, sin ajustes encima.</span></div>' +
          '<div class="impact-card"><b>Retorno auditado vs inversión</b><strong>' + roiAuditedMultiple.toFixed(1).replace('.', ',') + 'x</strong><span>Sobre impacto total auditado.</span></div>' +
          '<div class="impact-card"><b>Calidad del crecimiento</b><strong>' + pct(recompras) + '</strong><span>Recompra de generados; activos actuales ' + pct(activeRate) + '.</span></div>' +
          '<div class="impact-card"><b>Gap Trim Intro Mendiburu</b><strong>' + money(introGap) + '</strong><span>S/ 900 documentado cuando el Intro aparece visible como S/ 1,000.</span></div>' +
          '<div class="impact-card"><b>Matrícula no visible</b><strong>' + money(matriculaAudit.estimadaNoVisible) + '</strong><span>Ene-mar: S/ 399 por nuevo; abr-jun: Intro S/ 900 y PT S/ 399 cuando no aparece como fila.</span></div>' +
        '</div>' +
        '<div class="method-note"><b>Cómo medir impacto:</b> 1) venta nueva atribuida corregida, 2) matrículas cobradas por esos clientes, 3) recompra/LTV posterior, 4) clientes activos vs vencidos, 5) payback y retorno contra inversión. Así se mide el aporte de Llama Leads como crecimiento incremental y no solo como leads sueltos.</div>';
    }
    function renderKpis(rows) {
      const m = calc(rows);
      const p = pipeline();
      const mixRows = rows.filter(r => {
        const s = norm(r['Tipo servicio']);
        return s.includes('personal') || s.includes('membres');
      });
      const mixTotalQty = mixRows.length;
      const mixTotalMoney = mixRows.reduce((a, r) => a + Number(r.Pago || 0), 0);
      const ptRows = mixRows.filter(r => norm(r['Tipo servicio']).includes('personal'));
      const semiRows = mixRows.filter(r => norm(r['Tipo servicio']).includes('membres'));
      const ptMoney = ptRows.reduce((a, r) => a + Number(r.Pago || 0), 0);
      const semiMoney = semiRows.reduce((a, r) => a + Number(r.Pago || 0), 0);
      const introMix = introConversionMetrics(rows);
      const acq = acquisitionTotal(false);
      const matriculaAttrib = acquisitionMonthlyTotals(false).reduce((a, r) => a + Number(r.matricula || 0), 0);
      const ajusteIntro = acquisitionMonthlyTotals(false).reduce((a, r) => a + Number(r.ajusteIntro || 0), 0);
      const introGap = countedIntroGapTotal(false);
      const ltvAcumulado = p.total;
      const isSoloLlama = els.llama.value === 'Solo Llama Leads';
      const isAcquisitionView = els.matricula.value === 'Solo nuevos + matrículas';
      const primaryLabel = isAcquisitionView ? 'Nuevos + matrículas' : isSoloLlama ? 'Venta acumulada real' : 'Venta total';
      const primaryValue = isAcquisitionView ? acq : isSoloLlama ? ltvAcumulado : m.total;
      const primaryDetail = isAcquisitionView ? 'cara inicial de adquisición' : isSoloLlama ? p.generated.toLocaleString('es-PE') + ' clientes generados' : m.tx.toLocaleString('es-PE') + ' transacciones';
      const primaryPrev = isAcquisitionView || isSoloLlama ? attributedForPeriod(shiftMonth(periodKey(), -1)) : null;
      const primaryPrevYear = isAcquisitionView || isSoloLlama ? attributedForPeriod(shiftMonth(periodKey(), -12)) : null;
      const pk = periodKey();
      const pm = calc(rowsForPeriod(shiftMonth(pk, -1)));
      const py = calc(rowsForPeriod(shiftMonth(pk, -12)));
      document.querySelector('#filterLabel').textContent = [els.sede.value, els.year.value, els.mes.value, els.origen.value, els.plan.value, els.llama.value, els.matricula.value].join(' | ');
      const items = [
        [primaryLabel, money(primaryValue), primaryDetail, primaryValue, isAcquisitionView || isSoloLlama ? primaryPrev : pm.total, isAcquisitionView || isSoloLlama ? primaryPrevYear : py.total],
        ['Impacto real Llama Leads', money(acq), pct(m.total ? acq / m.total : 0) + ' del filtro', acq, attributedForPeriod(shiftMonth(pk, -1)), attributedForPeriod(shiftMonth(pk, -12))],
        ['Clientes unicos', m.clients.toLocaleString('es-PE'), m.active + ' activos', m.clients, pm.clients, py.clients],
        ['Clientes generados', p.generated.toLocaleString('es-PE'), money(p.total) + ' acumulado', p.generated, 0, 0],
        ['Ticket promedio', money2(m.tx ? m.total / m.tx : 0), 'por transaccion', m.tx ? m.total / m.tx : 0, pm.tx ? pm.total / pm.tx : 0, py.tx ? py.total / py.tx : 0],
        ['Churn proxy', pct(m.clients ? 1 - m.active / m.clients : 0), 'vencidos vs activos', m.clients ? 1 - m.active / m.clients : 0, pm.clients ? 1 - pm.active / pm.clients : 0, py.clients ? 1 - py.active / py.clients : 0],
        ['Recompra agencia', pct(p.generated ? p.repurchased / p.generated : 0), p.repurchased + ' clientes', p.repurchased, 0, 0],
        ['Abandono +1 mes', p.abandoned30.toLocaleString('es-PE'), 'vencidos hace mas de 30 dias', p.abandoned30, 0, 0]
      ];
      document.querySelector('#kpis').innerHTML = items.map(i => '<div class="kpi"><b>' + i[0] + '</b><strong>' + i[1] + '</strong><span>' + i[2] + '</span><div class="delta-row">' + deltaBadge(i[3], i[4], 'vs mes ant.') + deltaBadge(i[3], i[5], 'vs año ant.') + '</div></div>').join('');
      const attributedRecurrent = rows
        .filter(r => r['Atribuido agencia'] === 'Si' && norm(r['Tipo plan']).includes('renov') && !norm(r['Tipo servicio']).includes('matr'))
        .reduce((a, r) => a + Number(r.Pago || 0), 0);
      const captureMap = captureMonthByClient();
      const recurrentRows = rows.filter(r => r['Atribuido agencia'] === 'Si' && norm(r['Tipo plan']).includes('renov') && !norm(r['Tipo servicio']).includes('matr'));
      const previousCohortRecurrent = recurrentRows.filter(r => {
        const key = clientKeyFromParts(r.Sede, r.DNI, r.Celular, r.Cliente || r['Cliente Excel'] || r['Cliente captura']);
        const createdMonth = captureMap.get(key) || '';
        return createdMonth && createdMonth !== r.Mes;
      }).reduce((a, r) => a + Number(r.Pago || 0), 0);
      const sameMonthRecurrent = recurrentRows.filter(r => {
        const key = clientKeyFromParts(r.Sede, r.DNI, r.Celular, r.Cliente || r['Cliente Excel'] || r['Cliente captura']);
        const createdMonth = captureMap.get(key) || '';
        return createdMonth && createdMonth === r.Mes;
      }).reduce((a, r) => a + Number(r.Pago || 0), 0);
      const nuevaSinMatricula = Math.max(0, acq - matriculaAttrib - ajusteIntro);
      const saleWithoutLlama = Math.max(0, m.total - acq);
      document.querySelector('#salesSplit').innerHTML = [
        '<div class="counterfactual-card">' +
          '<div class="counterfactual-title"><b>Escenario sin Llama Leads</b><strong>Esto es lo que el negocio probablemente no habría capturado con la misma velocidad.</strong><span>Simulación simple del filtro actual: facturación real menos impacto Llama Leads documentado.</span></div>' +
          '<div><b>Venta real</b><strong>' + money(m.total) + '</strong><span>Facturación del filtro actual.</span></div>' +
          '<div><b>Sin Llama Leads</b><strong>' + money(saleWithoutLlama) + '</strong><span>Venta estimada sin clientes atribuidos.</span></div>' +
          '<div class="counterfactual-loss"><b>Brecha generada</b><strong>' + money(acq) + '</strong><span>' + pct(m.total ? acq / m.total : 0) + ' de la venta depende del impacto Llama.</span></div>' +
        '</div>',
        '<div class="split-card"><b>Venta nueva atribuida</b><strong>' + money(nuevaSinMatricula) + '</strong><span>sin matrícula</span></div>',
        '<div class="split-card"><b>Matrícula atribuida</b><strong>' + money(matriculaAttrib) + '</strong><span>costo separado</span></div>',
        '<div class="split-card"><b>Gap Trim Intro Mendiburu</b><strong>' + money(introGap) + '</strong><span>S/ 900 por Intro visible como S/ 1,000</span></div>',
        '<div class="split-card"><b>Venta recurrente atribuida</b><strong>' + money(attributedRecurrent) + '</strong><span>' + pct(m.attributed ? attributedRecurrent / m.attributed : 0) + ' de venta atribuida</span></div>',
        '<div class="split-card"><b>Recurrencia cartera previa</b><strong>' + money(previousCohortRecurrent) + '</strong><span>clientes creados en meses anteriores al mes de venta</span></div>',
        '<div class="split-card"><b>Recompra creados en mes</b><strong>' + money(sameMonthRecurrent) + '</strong><span>renovaciones de clientes creados en ese mismo mes</span></div>',
        '<div class="split-card"><b>Mix por cantidad</b><strong>PT ' + pct(mixTotalQty ? ptRows.length / mixTotalQty : 0) + '</strong><span>Semi ' + pct(mixTotalQty ? semiRows.length / mixTotalQty : 0) + ' | base PT+Semi: ' + mixTotalQty.toLocaleString('es-PE') + ' compras</span></div>',
        '<div class="split-card"><b>Mix por soles</b><strong>PT ' + pct(mixTotalMoney ? ptMoney / mixTotalMoney : 0) + '</strong><span>Semi ' + pct(mixTotalMoney ? semiMoney / mixTotalMoney : 0) + ' | base ' + money(mixTotalMoney) + '</span></div>',
        '<div class="split-card"><b>Conversion Trim Intro</b><strong>' + pct(introMix.total ? introMix.converted / introMix.total : 0) + '</strong><span>' + introMix.converted + ' de ' + introMix.total + ' pasaron a PT o Semi | PT ' + introMix.toPt + ' / Semi ' + introMix.toSemi + '</span></div>',
        '<div class="split-card"><b>Fuga real Trim Intro</b><strong>' + pct(introMix.total ? introMix.fugados / introMix.total : 0) + '</strong><span>' + introMix.fugados + ' vencidos sin recompra | ' + introMix.pending + ' pendientes/no vencidos</span></div>'
      ].join('');
      renderFlowCard();
      const stages = [
        ['Generados', p.generated, money(p.total)],
        ['Recompraron', p.repurchased, pct(p.generated ? p.repurchased / p.generated : 0)],
        ['Activos', p.active, pct(p.generated ? p.active / p.generated : 0)],
        ['Vencidos', p.churn, pct(p.generated ? p.churn / p.generated : 0)],
        ['+1 mes', p.abandoned30, 'sin recompra']
      ];
      document.querySelector('#pipeline').innerHTML = stages.map(s => '<div class="stage"><b>' + s[0] + '</b><strong>' + s[1] + '</strong><span>' + s[2] + '</span></div>').join('');
      renderImpactSummary(p, matriculaAttrib, ajusteIntro);
    }
    function canvasCtx(id) {
      const canvas = document.querySelector(id);
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(320, Math.floor(rect.width * ratio));
      canvas.height = Math.max(220, Math.floor(rect.height * ratio));
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { ctx, w: rect.width, h: rect.height };
    }
    function barChart(id, labels, values, opts = {}) {
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const pad = opts.horizontal ? { l: 116, r: 76, t: 18, b: 20 } : { l: 48, r: 18, t: 24, b: 58 };
      const max = Math.max(...values, 1);
      ctx.strokeStyle = '#d7dee9';
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
      ctx.font = '12px Segoe UI, Arial';
      if (opts.horizontal) {
        const rowH = (h - pad.t - pad.b) / Math.max(labels.length, 1);
        labels.forEach((label, i) => {
          const y = pad.t + i * rowH + 5;
          const bh = Math.max(10, rowH - 9);
          const bw = (w - pad.l - pad.r) * values[i] / max;
          ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(pad.l, y, bw, bh);
          ctx.fillStyle = '#334155'; ctx.textAlign = 'right'; ctx.fillText(label.slice(0, 22), pad.l - 8, y + bh - 2);
          ctx.textAlign = 'left'; ctx.fillStyle = '#172033'; ctx.fillText(opts.money ? money(values[i]) : values[i], pad.l + bw + 7, y + bh - 2);
        });
      } else {
        const slot = (w - pad.l - pad.r) / Math.max(labels.length, 1);
        const bw = Math.max(10, slot * .58);
        labels.forEach((label, i) => {
          const bh = (h - pad.t - pad.b) * values[i] / max;
          const x = pad.l + i * slot + (slot - bw) / 2;
          const y = h - pad.b - bh;
          ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(x, y, bw, bh);
          ctx.fillStyle = '#172033'; ctx.textAlign = 'center'; ctx.font = '11px Segoe UI, Arial';
          ctx.fillText(opts.money ? money(values[i]) : values[i], x + bw / 2, Math.max(12, y - 7));
          ctx.save(); ctx.translate(x + bw / 2, h - 12); ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = '#667085'; ctx.textAlign = 'right'; ctx.fillText(label, 0, 0); ctx.restore();
        });
      }
    }
    function lineChart(id, labels, values, opts = {}) {
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const pad = { l: 58, r: 24, t: 30, b: 58 };
      const max = Math.max(...values, 1);
      ctx.strokeStyle = '#d7dee9';
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
      ctx.strokeStyle = '#2468d8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      values.forEach((v, i) => {
        const x = pad.l + (labels.length === 1 ? 0 : i * (w - pad.l - pad.r) / (labels.length - 1));
        const y = h - pad.b - (h - pad.t - pad.b) * v / max;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      values.forEach((v, i) => {
        const x = pad.l + (labels.length === 1 ? 0 : i * (w - pad.l - pad.r) / (labels.length - 1));
        const y = h - pad.b - (h - pad.t - pad.b) * v / max;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2468d8'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#172033'; ctx.font = '11px Segoe UI, Arial'; ctx.textAlign = 'center';
        ctx.fillText(opts.money ? money(v) : v, x, Math.max(13, y - 10));
        ctx.save(); ctx.translate(x, h - 14); ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#667085'; ctx.textAlign = 'right'; ctx.fillText(labels[i], 0, 0); ctx.restore();
      });
    }
    function totalBillingStackedChart(id, rows) {
      const monthly = group(rows, r => r.Mes, (r, key) => ({
        key,
        nuevos: 0,
        renovaciones: 0,
        reinscripciones: 0,
        matriculas: 0,
        otros: 0
      }), (s, r) => {
        const amount = Number(r.Pago || 0);
        const plan = norm(r['Tipo plan']);
        const service = norm(r['Tipo servicio']);
        if (service.includes('matr')) s.matriculas += amount;
        else if (plan === 'nuevo') s.nuevos += amount;
        else if (plan.includes('renov')) s.renovaciones += amount;
        else if (plan.includes('reins')) s.reinscripciones += amount;
        else s.otros += amount;
      }).sort((a, b) => a.key.localeCompare(b.key));
      const labels = monthly.map(r => r.key);
      const totals = monthly.map(r => r.nuevos + r.renovaciones + r.reinscripciones + r.matriculas + r.otros);
      const series = [
        { key: 'nuevos', label: 'Nuevos', color: '#1f8a4c' },
        { key: 'renovaciones', label: 'Renovaciones', color: '#111111' },
        { key: 'reinscripciones', label: 'Reinscripciones', color: '#987447' },
        { key: 'matriculas', label: 'Matrículas', color: '#df1119' },
        { key: 'otros', label: 'Otros', color: '#526173' }
      ];
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const pad = { l: 64, r: 28, t: 46, b: 66 };
      const max = Math.max(...totals, 1);
      ctx.strokeStyle = '#d7dee9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, h - pad.b);
      ctx.lineTo(w - pad.r, h - pad.b);
      ctx.stroke();
      const slot = (w - pad.l - pad.r) / Math.max(labels.length, 1);
      const bw = Math.max(18, Math.min(58, slot * .55));
      monthly.forEach((row, i) => {
        const x = pad.l + i * slot + (slot - bw) / 2;
        let y = h - pad.b;
        series.forEach(s => {
          const value = Number(row[s.key] || 0);
          const bh = (h - pad.t - pad.b) * value / max;
          if (bh > 0) {
            y -= bh;
            ctx.fillStyle = s.color;
            ctx.fillRect(x, y, bw, bh);
            if (bh > 22) {
              ctx.fillStyle = '#fff';
              ctx.font = '10px Segoe UI, Arial';
              ctx.textAlign = 'center';
              ctx.fillText(money(value), x + bw / 2, y + bh / 2 + 4);
            }
          }
        });
        ctx.fillStyle = '#172033';
        ctx.font = '11px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(money(totals[i]), x + bw / 2, Math.max(14, y - 8));
        ctx.save();
        ctx.translate(x + bw / 2, h - 16);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#667085';
        ctx.textAlign = 'right';
        ctx.fillText(labels[i], 0, 0);
        ctx.restore();
      });
      let legendX = pad.l;
      series.forEach((s, i) => {
        const x = legendX;
        ctx.fillStyle = s.color;
        ctx.fillRect(x, 14, 11, 11);
        ctx.fillStyle = '#334155';
        ctx.font = '11px Segoe UI, Arial';
        ctx.textAlign = 'left';
        ctx.fillText(s.label, x + 16, 24);
        legendX += Math.max(86, ctx.measureText(s.label).width + 38);
      });
    }
    function attributedComboChart(id, rows) {
      const acq = acquisitionMonthlyTotals(false);
      const actual = group(rows.filter(r => r['Atribuido agencia'] === 'Si'), r => r.Mes, (r, key) => ({ key, actual: 0 }), (s, r) => {
        s.actual += Number(r.Pago || 0);
      });
      const captureMap = captureMonthByClient();
      const metricPurchases = filteredMetricPurchases();
      const recurrent = group(metricPurchases.filter(r => {
        return norm(r['Tipo plan']).includes('renov') && !norm(r['Tipo servicio']).includes('matr');
      }), r => r.Mes, (r, key) => ({ key, recurrentePrev: 0, recurrenteSame: 0 }), (s, r) => {
        const clientKey = clientKeyFromParts(r.Sede, r.DNI, r.Celular, r.Cliente || r['Cliente Excel'] || r['Cliente captura']);
        const createdMonth = captureMap.get(clientKey) || '';
        if (createdMonth && createdMonth === r.Mes) s.recurrenteSame += Number(r.Pago || 0);
        else s.recurrentePrev += Number(r.Pago || 0);
      });
      const acqByMonth = group(acq, r => r.key, (r, key) => ({ key, nuevos: 0, matricula: 0 }), (s, r) => {
        s.nuevos += Number(r.nuevos || 0);
        s.matricula += Number(r.matricula || 0);
        s.ajusteIntro = (s.ajusteIntro || 0) + Number(r.ajusteIntro || 0);
      });
      const monthKeys = [...new Set([...acqByMonth.map(r => r.key), ...actual.map(r => r.key), ...recurrent.map(r => r.key)])].sort();
      const acqMap = new Map(acqByMonth.map(r => [r.key, r]));
      const recurrentMap = new Map(recurrent.map(r => [r.key, r]));
      const months = monthKeys.map(key => {
        const acqRow = acqMap.get(key) || { nuevos: 0, matricula: 0 };
        const nuevos = acqRow.nuevos || 0;
        const matricula = acqRow.matricula || 0;
        const ajusteIntro = acqRow.ajusteIntro || 0;
        const recRow = recurrentMap.get(key) || { recurrentePrev: 0, recurrenteSame: 0 };
        const recurrentePrev = recRow.recurrentePrev || 0;
        const recurrenteSame = recRow.recurrenteSame || 0;
        return { key, nuevos, matricula, ajusteIntro, recurrentePrev, recurrenteSame, total: nuevos + matricula + ajusteIntro + recurrentePrev + recurrenteSame };
      });
      const labels = months.map(r => r.key);
      const totals = months.map(r => r.total);
      const nuevos = months.map(r => r.nuevos);
      const matriculas = months.map(r => r.matricula);
      const ajustesIntro = months.map(r => r.ajusteIntro);
      const recurrentesPrev = months.map(r => r.recurrentePrev);
      const recurrentesSame = months.map(r => r.recurrenteSame);
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const pad = { l: 58, r: 24, t: 42, b: 64 };
      const max = Math.max(...totals, ...nuevos, ...matriculas, ...ajustesIntro, ...recurrentesPrev, ...recurrentesSame, 1);
      ctx.strokeStyle = '#d7dee9';
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
      const slot = (w - pad.l - pad.r) / Math.max(labels.length, 1);
      const bw = Math.max(16, slot * .54);
      labels.forEach((label, i) => {
        const newH = (h - pad.t - pad.b) * nuevos[i] / max;
        const matH = (h - pad.t - pad.b) * matriculas[i] / max;
        const adjH = (h - pad.t - pad.b) * ajustesIntro[i] / max;
        const recPrevH = (h - pad.t - pad.b) * recurrentesPrev[i] / max;
        const recSameH = (h - pad.t - pad.b) * recurrentesSame[i] / max;
        const bh = newH + matH + adjH + recPrevH + recSameH;
        const x = pad.l + i * slot + (slot - bw) / 2;
        const y = h - pad.b - bh;
        ctx.fillStyle = '#1f8a4c';
        ctx.fillRect(x, h - pad.b - newH, bw, newH);
        ctx.fillStyle = '#c58a00';
        ctx.fillRect(x, h - pad.b - newH - matH, bw, matH);
        ctx.fillStyle = '#6b4bb7';
        ctx.fillRect(x, h - pad.b - newH - matH - adjH, bw, adjH);
        ctx.fillStyle = '#c44545';
        ctx.fillRect(x, h - pad.b - newH - matH - adjH - recPrevH, bw, recPrevH);
        ctx.fillStyle = '#0f8b83';
        ctx.fillRect(x, h - pad.b - newH - matH - adjH - recPrevH - recSameH, bw, recSameH);
        if (newH > 22) {
          ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI, Arial'; ctx.textAlign = 'center';
          ctx.fillText(money(nuevos[i]), x + bw / 2, h - pad.b - newH / 2 + 4);
        }
        if (matH > 22) {
          ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI, Arial'; ctx.textAlign = 'center';
          ctx.fillText(money(matriculas[i]), x + bw / 2, h - pad.b - newH - matH / 2 + 4);
        }
        if (adjH > 22) {
          ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI, Arial'; ctx.textAlign = 'center';
          ctx.fillText(money(ajustesIntro[i]), x + bw / 2, h - pad.b - newH - matH - adjH / 2 + 4);
        }
        if (recPrevH > 22) {
          ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI, Arial'; ctx.textAlign = 'center';
          ctx.fillText(money(recurrentesPrev[i]), x + bw / 2, h - pad.b - newH - matH - adjH - recPrevH / 2 + 4);
        }
        if (recSameH > 22) {
          ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI, Arial'; ctx.textAlign = 'center';
          ctx.fillText(money(recurrentesSame[i]), x + bw / 2, h - pad.b - newH - matH - adjH - recPrevH - recSameH / 2 + 4);
        }
        ctx.fillStyle = '#172033';
        ctx.font = '11px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(money(totals[i]), x + bw / 2, Math.max(14, y - 7));
        ctx.save(); ctx.translate(x + bw / 2, h - 16); ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#667085'; ctx.textAlign = 'right'; ctx.fillText(label, 0, 0); ctx.restore();
      });
      ctx.fillStyle = '#1f8a4c'; ctx.fillRect(pad.l, 12, 11, 11);
      ctx.fillStyle = '#334155'; ctx.font = '11px Segoe UI, Arial'; ctx.textAlign = 'left'; ctx.fillText('Nuevos', pad.l + 16, 22);
      ctx.fillStyle = '#c58a00'; ctx.fillRect(pad.l + 132, 12, 11, 11);
      ctx.fillStyle = '#334155'; ctx.fillText('Matrícula', pad.l + 148, 22);
      ctx.fillStyle = '#6b4bb7'; ctx.fillRect(pad.l + 230, 12, 11, 11);
      ctx.fillStyle = '#334155'; ctx.fillText('Ajuste Intro', pad.l + 246, 22);
      ctx.fillStyle = '#c44545'; ctx.fillRect(pad.l + 340, 12, 11, 11);
      ctx.fillStyle = '#334155'; ctx.fillText('Rec. cartera previa', pad.l + 356, 22);
      ctx.fillStyle = '#0f8b83'; ctx.fillRect(pad.l + 488, 12, 11, 11);
      ctx.fillStyle = '#334155'; ctx.fillText('Recompra mes', pad.l + 504, 22);
    }
    function donutChart(id, labels, values) {
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const cx = w * .36, cy = h * .5, r = Math.min(w, h) * .28;
      const total = values.reduce((a, b) => a + b, 0) || 1;
      let a0 = -Math.PI / 2;
      values.forEach((v, i) => {
        const a1 = a0 + Math.PI * 2 * v / total;
        ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.arc(cx, cy, r * .58, a1, a0, true); ctx.closePath();
        ctx.fillStyle = colors[i % colors.length]; ctx.fill(); a0 = a1;
      });
      ctx.font = '12px Segoe UI, Arial';
      labels.forEach((label, i) => {
        const y = 38 + i * 25;
        ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(w * .62, y - 10, 11, 11);
        ctx.fillStyle = '#334155'; ctx.fillText(label + ' - ' + money(values[i]), w * .62 + 18, y);
      });
    }
    function programMixMonthlyChart(id, rows) {
      const monthly = group(
        rows.filter(r => {
          const s = norm(r['Tipo servicio']);
          return s.includes('personal') || s.includes('membres');
        }),
        r => r.Mes,
        (r, key) => ({ key, pt: 0, semi: 0 }),
        (s, r) => {
          const amount = Number(r.Pago || 0);
          if (norm(r['Tipo servicio']).includes('personal')) s.pt += amount;
          if (norm(r['Tipo servicio']).includes('membres')) s.semi += amount;
        }
      ).sort((a, b) => a.key.localeCompare(b.key));
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const pad = { l: 48, r: 22, t: 42, b: 58 };
      ctx.strokeStyle = '#d7dee9';
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
      ctx.fillStyle = '#2468d8'; ctx.fillRect(pad.l, 13, 11, 11);
      ctx.fillStyle = '#334155'; ctx.font = '12px Segoe UI, Arial'; ctx.textAlign = 'left'; ctx.fillText('PT', pad.l + 16, 23);
      ctx.fillStyle = '#1f8a4c'; ctx.fillRect(pad.l + 70, 13, 11, 11);
      ctx.fillStyle = '#334155'; ctx.fillText('Semi', pad.l + 86, 23);
      const labels = monthly.map(r => r.key);
      const slot = (w - pad.l - pad.r) / Math.max(labels.length, 1);
      const bw = Math.max(18, slot * .56);
      monthly.forEach((r, i) => {
        const total = r.pt + r.semi || 1;
        const ptShare = r.pt / total;
        const semiShare = r.semi / total;
        const x = pad.l + i * slot + (slot - bw) / 2;
        const chartH = h - pad.t - pad.b;
        const semiH = chartH * semiShare;
        const ptH = chartH * ptShare;
        ctx.fillStyle = '#1f8a4c';
        ctx.fillRect(x, h - pad.b - semiH, bw, semiH);
        ctx.fillStyle = '#2468d8';
        ctx.fillRect(x, h - pad.b - semiH - ptH, bw, ptH);
        ctx.font = '10px Segoe UI, Arial';
        ctx.textAlign = 'center';
        if (ptH > 24) {
          ctx.fillStyle = '#fff';
          ctx.fillText(Math.round(ptShare * 100) + '%', x + bw / 2, h - pad.b - semiH - ptH / 2 + 4);
        }
        if (semiH > 24) {
          ctx.fillStyle = '#fff';
          ctx.fillText(Math.round(semiShare * 100) + '%', x + bw / 2, h - pad.b - semiH / 2 + 4);
        }
        ctx.fillStyle = '#172033';
        ctx.font = '10px Segoe UI, Arial';
        ctx.fillText(money(total), x + bw / 2, Math.max(14, h - pad.b - chartH - 7));
        ctx.save(); ctx.translate(x + bw / 2, h - 14); ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#667085'; ctx.textAlign = 'right'; ctx.fillText(labels[i], 0, 0); ctx.restore();
      });
    }
    function introConversionChart(id, rows) {
      const m = introConversionMetrics(rows);
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const total = Math.max(m.total, 1);
      const items = [
        { label: 'Trim Intro', value: m.total, sub: 'cohorte detectada', color: '#2468d8' },
        { label: 'Convirtieron', value: m.converted, sub: 'PT o Semi', color: '#1f8a4c' },
        { label: 'Pasaron a PT', value: m.toPt, sub: 'recompra Personal Training', color: '#0f8b83' },
        { label: 'Pasaron a Semi', value: m.toSemi, sub: 'recompra Semi personalizado', color: '#6951b8' },
        { label: 'Fuga real', value: m.fugados, sub: 'vencidos sin recompra', color: '#c44545' },
        { label: 'Pendientes', value: m.pending, sub: 'no vencidos o en ventana', color: '#b77900' }
      ];
      const pad = { l: 132, r: 92, t: 28, b: 18 };
      const rowH = (h - pad.t - pad.b) / items.length;
      ctx.font = '12px Segoe UI, Arial';
      items.forEach((item, i) => {
        const y = pad.t + i * rowH + 7;
        const bh = Math.max(16, rowH - 12);
        const bw = (w - pad.l - pad.r) * item.value / total;
        ctx.fillStyle = '#eef2f7';
        roundRect(ctx, pad.l, y, w - pad.l - pad.r, bh, 8);
        ctx.fill();
        ctx.fillStyle = item.color;
        roundRect(ctx, pad.l, y, Math.max(item.value ? 12 : 0, bw), bh, 8);
        ctx.fill();
        ctx.textAlign = 'right';
        ctx.fillStyle = '#172033';
        ctx.font = '800 12px Segoe UI, Arial';
        ctx.fillText(item.label, pad.l - 10, y + 13);
        ctx.fillStyle = '#667085';
        ctx.font = '10px Segoe UI, Arial';
        ctx.fillText(item.sub, pad.l - 10, y + 27);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#172033';
        ctx.font = '800 12px Segoe UI, Arial';
        const share = item.label === 'Trim Intro' ? '100%' : pct(m.total ? item.value / m.total : 0);
        ctx.fillText(item.value + ' · ' + share, pad.l + Math.max(bw, 12) + 8, y + 18);
      });
      ctx.fillStyle = '#334155';
      ctx.font = '12px Segoe UI, Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Conversión real: ' + pct(m.total ? m.converted / m.total : 0) + ' | Fuga real: ' + pct(m.total ? m.fugados / m.total : 0), pad.l, 16);
    }
    function roundRect(ctx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
    function funnelChart(id, stages, title = '') {
      const { ctx, w, h } = canvasCtx(id);
      ctx.clearRect(0, 0, w, h);
      const top = 64;
      const gap = 18;
      const blockH = Math.max(86, Math.min(112, (h - top - 30 - gap * (stages.length - 1)) / stages.length));
      const maxW = Math.min(w - 120, 820);
      const minW = Math.max(260, maxW * .56);
      ctx.fillStyle = '#172033';
      ctx.textAlign = 'center';
      ctx.font = '700 16px Segoe UI, Arial';
      ctx.fillText(title || 'Todas las sedes', w / 2, 22);
      ctx.fillStyle = '#667085';
      ctx.font = '12px Segoe UI, Arial';
      ctx.fillText('pipeline operativo: leads, formularios, citas y cierres', w / 2, 40);
      stages.forEach((s, i) => {
        const width = maxW - (maxW - minW) * (i / Math.max(stages.length - 1, 1));
        const x = (w - width) / 2;
        const y = top + i * (blockH + gap);
        ctx.shadowColor = 'rgba(15, 23, 42, .16)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = s.color;
        roundRect(ctx, x, y, width, blockH, 8);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '700 13px Segoe UI, Arial';
        ctx.fillText(s.label, x + width / 2, y + 22);
        ctx.font = '700 34px Segoe UI, Arial';
        ctx.fillText(String(s.value), x + width / 2, y + 60);
        ctx.font = '700 12px Segoe UI, Arial';
        ctx.fillText(s.prevText, x + width / 2, y + blockH - 34);
        ctx.font = '600 11px Segoe UI, Arial';
        ctx.fillText(s.detail, x + width / 2, y + blockH - 14);
      });
    }
    function selectedLeadPipeline() {
      const sedes = els.sede.value === 'Todos' ? Object.keys(leadPipelineBySede) : [els.sede.value].filter(s => leadPipelineBySede[s]);
      const labels = ['Nuevos leads', 'Formulario', 'Citas agendadas', 'Citas asistidas', 'Cierres'];
      const spend = sedes.reduce((a, sede) => a + Number(leadPipelineBySede[sede]?.spend || 0), 0);
      return labels.map((label, index) => {
        const value = sedes.reduce((a, sede) => a + Number(leadPipelineBySede[sede]?.stages[index]?.value || 0), 0);
        const cp = value ? spend / value : 0;
        const first = sedes.reduce((a, sede) => a + Number(leadPipelineBySede[sede]?.stages[0]?.value || 0), 0);
        const previous = index === 0 ? value : sedes.reduce((a, sede) => a + Number(leadPipelineBySede[sede]?.stages[index - 1]?.value || 0), 0);
        const prevText = index === 0 ? 'Base inicial' : pct(previous ? value / previous : 0) + ' vs etapa anterior';
        const detail = money(cp) + ' CP etapa';
        return { label, value, prevText, detail, color: colors[index % colors.length] };
      });
    }
    function selectedLeadPipelineLabel() {
      return els.sede.value === 'Todos' ? 'Todas las sedes' : els.sede.value;
    }
    function generatedForSede(sede) {
      return filteredGenerated().filter(r => r.Sede === sede);
    }
    function renderSedeCards(rows) {
      const sedes = ['Trim 1 - Mendiburu', 'Trim 2 - Balboa', 'Trim 3 - Benavides'].filter(s => els.sede.value === 'Todos' || els.sede.value === s);
      const impactRows = acquisitionMonthlyTotals(false);
      document.querySelector('#sedeCards').innerHTML = sedes.map((sede, index) => {
        const sedeRows = rows.filter(r => r.Sede === sede);
        const sale = sedeRows.reduce((a, r) => a + Number(r.Pago || 0), 0);
        const impact = impactRows.filter(r => r.sede === sede).reduce((a, r) => a + Number(r.value || 0), 0);
        const generated = generatedForSede(sede);
        const repurchase = generated.length ? generated.filter(r => Number(r['Compras posteriores'] || 0) > 0).length / generated.length : 0;
        const ticket = generated.length ? generated.reduce((a, r) => a + Number(r['Total pagado'] || 0), 0) / generated.length : 0;
        const short = sede.replace('Trim 1 - ', '').replace('Trim 2 - ', '').replace('Trim 3 - ', '').toUpperCase();
        const labels = ['Fuerte crecimiento', 'Estable', 'Oportunidad'];
        return '<article class="sede-card">' +
          '<div class="sede-card-head"><h3>' + short + '</h3><span class="sede-badge">' + labels[index] + '</span></div>' +
          '<div class="sede-main">' +
            '<div><b>Venta filtro</b><strong>' + money(sale) + '</strong></div>' +
            '<div><b>Impacto Llama</b><strong>' + money(impact) + '</strong></div>' +
            '<div><b>% de venta</b><strong>' + pct(sale ? impact / sale : 0) + '</strong></div>' +
          '</div>' +
          '<div class="sede-foot">' +
            '<div><b>Clientes generados</b><strong>' + generated.length + '</strong></div>' +
            '<div><b>Recompra</b><strong>' + pct(repurchase) + '</strong></div>' +
            '<div><b>Ticket prom.</b><strong>' + money(ticket) + '</strong></div>' +
          '</div>' +
        '</article>';
      }).join('');
    }
    function renderClient360() {
      const clients = filteredGenerated().sort((a, b) => Number(b['Total pagado'] || 0) - Number(a['Total pagado'] || 0));
      const c = clients[0];
      if (!c) {
        document.querySelector('#client360').innerHTML = '<div class="client360-head"><h2>Cliente 360</h2><span class="client-close">×</span></div><p class="hint">Sin clientes generados para este filtro.</p>';
        return;
      }
      const purchases = (METRICS.Compras || []).filter(r => r.Sede === c.Sede && norm(r['Cliente captura']) === norm(c['Cliente captura']))
        .sort((a, b) => String(b.Inscripcion || '').localeCompare(String(a.Inscripcion || '')))
        .slice(0, 5);
      const initials = String(c['Cliente captura'] || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
      const status = c['Estado a 30/06/2026'] || 's/d';
      document.querySelector('#client360').innerHTML =
        '<div class="client360-head"><h2>Cliente 360</h2><span class="client-close">×</span></div>' +
        '<div class="client-profile"><div class="client-avatar">' + escapeHtml(initials) + '</div><div><div class="client-name">' + escapeHtml(c['Cliente captura']) + '</div><div class="client-source">' + escapeHtml(c.Sede) + ' · Llama Leads</div></div></div>' +
        '<div class="client-stat-list">' +
          '<div class="client-stat"><b>LTV total</b><strong>' + money(c['Total pagado']) + '</strong></div>' +
          '<div class="client-stat"><b>Compras</b><strong>' + (c['Compras total'] || 0) + '</strong></div>' +
          '<div class="client-stat"><b>Primera compra</b><strong>' + escapeHtml(c['Primera compra'] || '-') + '</strong></div>' +
          '<div class="client-stat"><b>Última compra</b><strong>' + escapeHtml(c['Ultima compra'] || '-') + '</strong></div>' +
          '<div class="client-stat"><b>Estado actual</b><strong>' + escapeHtml(status) + '</strong></div>' +
        '</div>' +
        '<div class="purchase-list"><h2>Historial de compras</h2>' +
          purchases.map(p => '<div class="purchase-item"><div><b>' + escapeHtml(p['Tipo plan'] || '-') + '</b><span>' + escapeHtml(p.Inscripcion || '-') + ' · ' + escapeHtml(p['Tipo servicio'] || '-') + '</span></div><strong>' + money(p.Pago) + '</strong></div>').join('') +
        '</div>';
    }
    function renderCharts(rows) {
      const months = group(rows, r => r.Mes, (r, key) => ({ key, sale: 0, attrib: 0 }), (s, r) => {
        s.sale += Number(r.Pago || 0);
        if (r['Atribuido agencia'] === 'Si') s.attrib += Number(r.Pago || 0);
      }).sort((a, b) => a.key.localeCompare(b.key));
      attributedComboChart('#attribChart', rows);
      totalBillingStackedChart('#salesChart', rows);
      const source = group(rows, r => r.Origen || 'Sin origen', (r, key) => ({ key, sale: 0 }), (s, r) => { s.sale += Number(r.Pago || 0); }).sort((a, b) => b.sale - a.sale).slice(0, 8);
      barChart('#sourceChart', source.map(r => r.key), source.map(r => r.sale), { money: true, horizontal: true });
      const pipelineLabel = selectedLeadPipelineLabel();
      document.querySelector('#pipelineFilterLabel').textContent = pipelineLabel;
      funnelChart('#pipelineChart', selectedLeadPipeline(), pipelineLabel);
      const plan = group(rows, r => r['Tipo plan'] || 'Sin plan', (r, key) => ({ key, sale: 0 }), (s, r) => { s.sale += Number(r.Pago || 0); }).sort((a, b) => b.sale - a.sale);
      donutChart('#planChart', plan.map(r => r.key), plan.map(r => r.sale));
      programMixMonthlyChart('#programMixChart', rows);
      introConversionChart('#introConversionChart', rows);
    }
    function renderTables(rows) {
      const byMonth = group(rows, r => r.Sede + '|' + r.Mes, r => ({ sede: r.Sede, mes: r.Mes, sale: 0, attrib: 0, tx: 0, clients: new Set(), active: new Set() }), (s, r) => {
        s.sale += Number(r.Pago || 0); s.tx += 1; s.clients.add(r['Cliente norm']);
        if (r['Atribuido agencia'] === 'Si') s.attrib += Number(r.Pago || 0);
        if (r['Estado actual'] === 'Activo') s.active.add(r['Cliente norm']);
      }).sort((a, b) => a.mes.localeCompare(b.mes) || a.sede.localeCompare(b.sede));
      const correctedAttrib = new Map(acquisitionMonthlyTotals(false).map(r => [r.sede + '|' + r.key, r.value]));
      byMonth.forEach(r => {
        const corrected = correctedAttrib.get(r.sede + '|' + r.mes);
        if (corrected !== undefined) r.attrib = corrected;
      });
      document.querySelector('#monthCount').textContent = byMonth.length + ' filas';
      document.querySelector('#monthTable').innerHTML = table(['Sede','Mes','Venta total','Venta atribuida','% atrib.','Tx','Clientes','Activos'], byMonth.map(r => [r.sede, r.mes, money(r.sale), money(r.attrib), pct(r.sale ? r.attrib / r.sale : 0), r.tx, r.clients.size, r.active.size]), [2,3,4,5,6,7]);
      const attributedRows = rows.filter(r => r['Atribuido agencia'] === 'Si');
      const byClient = group(attributedRows, r => r.Sede + '|' + r['Cliente norm'], r => ({
        sede: r.Sede,
        cliente: r.Cliente,
        total: 0,
        tx: 0,
        nuevo: 0,
        recurrente: 0,
        matricula: 0,
        ajuste: 0,
        ultimoMes: r.Mes || ''
      }), (s, r) => {
        const pago = Number(r.Pago || 0);
        s.total += pago;
        s.tx += 1;
        if (String(r.Mes || '') > String(s.ultimoMes || '')) s.ultimoMes = r.Mes;
        if (r['Es matricula'] === 'Si') s.matricula += pago;
        else if (r['Es ajuste intro'] === 'Si') s.ajuste += pago;
        else if (norm(r['Tipo plan']) === 'nuevo') s.nuevo += pago;
        else s.recurrente += pago;
      }).sort((a, b) => b.total - a.total || a.cliente.localeCompare(b.cliente));
      document.querySelector('#attribRankCount').textContent = byClient.length + ' clientes';
      document.querySelector('#attribRankTable').innerHTML = table(['#','Sede','Cliente','Total atribuido','Nuevo','Recurrente','Matrícula','Ajuste Intro','Tx','Último mes'], byClient.map((r, i) => [i + 1, r.sede, r.cliente, money(r.total), money(r.nuevo), money(r.recurrente), money(r.matricula), money(r.ajuste), r.tx, r.ultimoMes]), [0,3,4,5,6,7,8]);
      const historical = historicalValidationRows();
      const historicalMatched = historical.filter(r => r.match === 'Si');
      document.querySelector('#historicalCount').textContent = historicalMatched.length + '/' + historical.length + ' con match | ' + money(historicalMatched.reduce((a, r) => a + Number(r.total || 0), 0));
      document.querySelector('#historicalTable').innerHTML = table(['Fecha lead','Cliente lead','Fuente','Match','Sede','Cliente encontrado','Total comprado','Tx','Primera compra','Última compra'], historical.map(r => [r.date, r.name, r.source, r.match === 'Si' ? '<span class="pill yes">' + r.matchType + '</span>' : '<span class="pill bad">Sin match</span>', r.sede || '-', r.clienteExcel || '-', money(r.total), r.tx, r.primeraCompra || '-', r.ultimaCompra || '-']), [6,7]);
      const sorted = [...rows].sort((a, b) => String(b.Inscripcion).localeCompare(String(a.Inscripcion))).slice(0, 500);
      document.querySelector('#rowCount').textContent = rows.length.toLocaleString('es-PE') + ' ventas';
      document.querySelector('#salesTable').innerHTML = table(['Sede','Mes','Cliente','Plan','Origen','Servicio','Estado','Pago','Atribuido'], sorted.map(r => [r.Sede, r.Mes, r.Cliente, r['Tipo plan'], r.Origen, r['Tipo servicio'], r['Estado actual'] === 'Activo' ? '<span class="pill ok">Activo</span>' : '<span class="pill bad">Vencido</span>', money(r.Pago), r['Atribuido agencia'] === 'Si' ? '<span class="pill yes">Si</span>' : 'No']), [7]);
    }
    function table(headers, rows, numeric = []) {
      if (!rows.length) return '<tbody><tr><td>Sin resultados para este filtro.</td></tr></tbody>';
      return '<thead><tr>' + headers.map((h, i) => '<th class="' + (numeric.includes(i) ? 'num' : '') + '">' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map((c, i) => '<td class="' + (numeric.includes(i) ? 'num' : '') + '">' + c + '</td>').join('') + '</tr>').join('') + '</tbody>';
    }
    function update() {
      const rows = filteredRows();
      renderKpis(rows);
      renderCharts(rows);
      renderSedeCards(rows);
      renderClient360();
      renderTables(rows);
    }
    Object.values(els).forEach(el => el.addEventListener('input', update));
    document.querySelector('#exportClients')?.addEventListener('click', () => {
      const table = document.querySelector('#attribRankTable');
      const lines = [...table.querySelectorAll('tr')].map(tr => [...tr.children].map(td => '"' + String(td.textContent || '').replace(/"/g, '""') + '"').join(','));
      const blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clientes_atribuidos_trim_gym.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
    window.addEventListener('resize', update);
    update();
  </script>
</body>
</html>`;

await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, html, "utf8");
console.log(outPath);
