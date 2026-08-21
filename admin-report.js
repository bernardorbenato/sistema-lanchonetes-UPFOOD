/* ===================================
   UPFOOD ADMIN — Reports
   =================================== */

'use strict';

function getOrders() { return DB.get('orders') || []; }

// ─── KPI Calculations ─────────────────────────────────────────────────────────

function calcKPIs() {
  const orders = getOrders();
  const done   = orders.filter(o => o.status === 'done');
  const today  = new Date().toDateString();
  const todayOrders = done.filter(o => new Date(o.date).toDateString() === today);

  const totalRev  = done.reduce((s, o) => s + o.total, 0);
  const todayRev  = todayOrders.reduce((s, o) => s + o.total, 0);
  const totalItems = done.reduce((s, o) => s + o.items.reduce((si, it) => si + it.quantity, 0), 0);

  // Average ticket
  const avgTicket = done.length ? totalRev / done.length : 0;

  // Return rate (fake)
  const uniqueStudents = [...new Set(done.map(o => o.email))].length;
  const returnRate = done.length > 0 ? Math.round((uniqueStudents / STUDENTS_TOTAL) * 100) : 0;

  return { totalRev, todayRev, totalItems, avgTicket, returnRate, doneCount: done.length, todayCount: todayOrders.length };
}

const STUDENTS_TOTAL = 10;

function renderKPIs() {
  const k = calcKPIs();

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('kpi-revenue',     formatBRL(k.totalRev));
  set('kpi-today-rev',   formatBRL(k.todayRev));
  set('kpi-orders',      k.doneCount);
  set('kpi-today',       k.todayCount);
  set('kpi-ticket',      formatBRL(k.avgTicket));
  set('kpi-items',       k.totalItems);
  set('kpi-return',      k.returnRate + '%');
}

// ─── Top Products ─────────────────────────────────────────────────────────────

function calcTopProducts() {
  const counts = {};
  const revenue = {};
  getOrders().filter(o => o.status === 'done').forEach(o => {
    o.items.forEach(it => {
      counts[it.name]  = (counts[it.name]  || 0) + it.quantity;
      revenue[it.name] = (revenue[it.name] || 0) + it.price * it.quantity;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, qty]) => ({ name, qty, revenue: revenue[name] || 0 }));
}

function renderTopProducts() {
  const list = document.getElementById('top-products-list');
  if (!list) return;

  const top = calcTopProducts();
  const max = top[0]?.qty || 1;

  if (top.length === 0) {
    list.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px">Sem dados disponíveis</p>';
    return;
  }

  list.innerHTML = top.map((p, i) => {
    const pct = Math.round((p.qty / max) * 100);
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px">
            <span style="color:var(--text-4);font-size:11px;min-width:16px">#${i+1}</span>
            ${p.name}
          </span>
          <span style="font-size:12px;color:var(--text-3)">${p.qty} un. · ${formatBRL(p.revenue)}</span>
        </div>
        <div class="stock-bar" style="width:100%;height:6px">
          <div class="stock-bar-fill" style="width:${pct}%;background:var(--orange)"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Weekly Revenue Chart ─────────────────────────────────────────────────────

function calcWeeklyRevenue() {
  const days  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const data  = Array(7).fill(0);
  const today = new Date();

  getOrders().filter(o => o.status === 'done').forEach(o => {
    const d   = new Date(o.date);
    const diff = Math.floor((today - d) / 86400000);
    if (diff < 7) {
      const dayIdx = (today.getDay() - diff + 7) % 7;
      data[dayIdx] += o.total;
    }
  });

  // Reorder starting from today
  const reordered = [];
  for (let i = 6; i >= 0; i--) {
    const dayIdx = (today.getDay() - i + 7) % 7;
    reordered.push({ label: days[dayIdx], value: data[dayIdx] });
  }
  return reordered;
}

function renderWeeklyChart() {
  const chart = document.getElementById('weekly-chart');
  if (!chart) return;

  const data = calcWeeklyRevenue();
  const max  = Math.max(...data.map(d => d.value), 1);

  chart.innerHTML = data.map(d => {
    const h   = Math.max(4, Math.round((d.value / max) * 110));
    const val = d.value > 0 ? formatBRL(d.value).replace('R$ ','R$') : '—';
    return `
      <div class="chart-bar-col">
        <div class="chart-bar-val">${val}</div>
        <div class="chart-bar" style="height:${h}px" title="${val}"></div>
        <div class="chart-bar-label">${d.label}</div>
      </div>
    `;
  }).join('');
}

// ─── Block Activity ───────────────────────────────────────────────────────────

function calcBlockActivity() {
  const counts = {};
  getOrders().filter(o => o.status === 'done').forEach(o => {
    counts[o.block] = (counts[o.block] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function renderBlockChart() {
  const chart = document.getElementById('block-chart');
  if (!chart) return;

  const data = calcBlockActivity();
  const max  = data[0]?.[1] || 1;

  chart.innerHTML = data.map(([block, count]) => {
    const h = Math.max(4, Math.round((count / max) * 110));
    return `
      <div class="chart-bar-col">
        <div class="chart-bar-val">${count}</div>
        <div class="chart-bar" style="height:${h}px;background:var(--orange)" title="${count} pedidos"></div>
        <div class="chart-bar-label">${block}</div>
      </div>
    `;
  }).join('');
}

// ─── Peak Hours Heatmap ───────────────────────────────────────────────────────

function renderPeakHours() {
  const hm = document.getElementById('peak-heatmap');
  if (!hm) return;

  // Fake heat levels for 8 time slots
  const slots = [
    { label:'7h',  level:'h1' },
    { label:'9h',  level:'h3' },
    { label:'11h', level:'h5' },
    { label:'12h', level:'h4' },
    { label:'13h', level:'h5' },
    { label:'15h', level:'h3' },
    { label:'17h', level:'h4' },
    { label:'19h', level:'h2' },
  ];

  hm.innerHTML = slots.map(s => `
    <div class="hm-cell ${s.level}" title="${s.label} — ${({h1:'Baixo',h2:'Moderado',h3:'Alto',h4:'Muito Alto',h5:'Pico'})[s.level]}"></div>
  `).join('');

  const labels = document.getElementById('peak-labels');
  if (labels) {
    labels.innerHTML = slots.map(s =>
      `<span style="flex:1;text-align:center;font-size:9px;color:var(--text-3)">${s.label}</span>`
    ).join('');
  }
}

// ─── Payment Methods Breakdown ────────────────────────────────────────────────

function renderPaymentBreakdown() {
  const list = document.getElementById('payment-breakdown');
  if (!list) return;

  const counts = {};
  const orders = getOrders().filter(o => o.status === 'done');
  orders.forEach(o => {
    counts[o.paymentMethod] = (counts[o.paymentMethod] || 0) + 1;
  });

  const total = orders.length || 1;
  const icons = { pix:'⚡', cartao:'💳', vr:'🎫', dinheiro:'💵', na_hora:'🕐' };
  const names = { pix:'PIX', cartao:'Cartão', vr:'VR / VA', dinheiro:'Dinheiro', na_hora:'Pagar na Hora' };
  const colors= ['var(--orange)','var(--blue)','var(--purple)','var(--green)','var(--yellow)'];

  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);

  list.innerHTML = sorted.map(([method, count], i) => {
    const pct = Math.round((count / total) * 100);
    return `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px">
          <span>${icons[method] || '💳'} ${names[method] || method}</span>
          <span style="font-weight:700;color:${colors[i % colors.length]}">${pct}%</span>
        </div>
        <div class="stock-bar" style="width:100%;height:6px">
          <div class="stock-bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}"></div>
        </div>
      </div>
    `;
  }).join('') || '<p class="text-muted">Sem dados</p>';
}

// ─── Recent Transactions Table ────────────────────────────────────────────────

function renderRecentTransactions() {
  const tbody = document.getElementById('transactions-tbody');
  if (!tbody) return;

  const orders = getOrders()
    .filter(o => o.status === 'done')
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-3)">Sem transações registradas</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span class="td-mono">${o.id}</span></td>
      <td>
        <div class="td-main">${o.student}</div>
        <div class="td-sub">${o.email}</div>
      </td>
      <td>${o.block}</td>
      <td class="fw-bold text-orange">${formatBRL(o.total)}</td>
      <td>${formatDate(o.date)}</td>
    </tr>
  `).join('');
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

function renderSummaryStats() {
  const orders = getOrders().filter(o => o.status === 'done');
  const products = DB.get('products') || [];

  // Most sold
  const counts = {};
  orders.forEach(o => o.items.forEach(it => {
    counts[it.name] = (counts[it.name] || 0) + it.quantity;
  }));
  const topProduct = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

  const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  el('summary-top-product', topProduct);
  el('summary-avg-ticket', formatBRL(orders.length ? orders.reduce((s,o) => s+o.total, 0) / orders.length : 0));
  el('summary-total-revenue', formatBRL(orders.reduce((s,o) => s+o.total, 0)));
  el('summary-total-orders', orders.length);
}

document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderTopProducts();
  renderWeeklyChart();
  renderBlockChart();
  renderPeakHours();
  renderPaymentBreakdown();
  renderRecentTransactions();
  renderSummaryStats();
});
