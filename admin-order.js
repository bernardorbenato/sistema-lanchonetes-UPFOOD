/* ===================================
   UPFOOD ADMIN — Orders Management
   =================================== */

'use strict';

const STATUS_LABELS = { pending:'Pendente', prep:'Em Preparo', ready:'Pronto', done:'Finalizado' };
const STATUS_PILLS  = { pending:'pending',  prep:'prep',       ready:'ready',  done:'done' };
const PAY_ICONS     = { pix:'⚡', cartao:'💳', vr:'🎫', dinheiro:'💵', na_hora:'🕐' };
const PAY_LABELS    = { pix:'PIX', cartao:'Cartão', vr:'VR/VA', dinheiro:'Dinheiro', na_hora:'Na hora' };

let currentTab = 'pending';
let searchQuery = '';
let filterBlock = 'all';

function getOrders() { return DB.get('orders') || []; }
function setOrders(o) { DB.set('orders', o); }

function updateOrderStatus(id, newStatus) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx < 0) return;
  orders[idx].status = newStatus;
  orders[idx].updatedAt = new Date().toISOString();
  setOrders(orders);

  const labels = { pending:'Recebido', prep:'Em Preparo', ready:'Pronto para Retirada', done:'Finalizado' };
  showToast(`Pedido ${id} → ${labels[newStatus]}`, newStatus === 'done' ? 'success' : 'order');
  renderOrders();
  updateTabCounts();
}

window.updateOrderStatus = updateOrderStatus;

function buildOrderCard(order) {
  const itemsHTML = order.items.map(it =>
    `<li>
      <span><span class="qty">${it.quantity}x</span> ${it.name}</span>
      <span class="price">${formatBRL(it.price * it.quantity)}</span>
    </li>`
  ).join('');

  let footerBtns = '';
  if (order.status === 'pending') {
    footerBtns = `
      <button class="btn btn-blue btn-sm" onclick="updateOrderStatus('${order.id}','prep')">
        🍳 Iniciar Preparo
      </button>
      <button class="btn btn-red btn-sm" onclick="confirmAction('Cancelar pedido ${order.id}?', () => updateOrderStatus('${order.id}','canceled'))">
        ✕ Cancelar
      </button>
    `;
  } else if (order.status === 'prep') {
    footerBtns = `
      <button class="btn btn-orange btn-sm" onclick="updateOrderStatus('${order.id}','ready')">
        🔔 Marcar Pronto
      </button>
    `;
  } else if (order.status === 'ready') {
    footerBtns = `
      <button class="btn btn-green btn-sm" onclick="updateOrderStatus('${order.id}','done')">
        ✅ Finalizar
      </button>
    `;
  }

  const payIcon  = PAY_ICONS[order.paymentMethod]  || '💳';
  const payLabel = PAY_LABELS[order.paymentMethod] || order.paymentMethod;

  return `
    <div class="order-card" id="card-${order.id}">
      <div class="order-card-head">
        <div>
          <div class="order-num">${order.id}</div>
          <div class="order-student">${order.student}</div>
          <div class="order-meta">
            <span>📍 ${order.block}</span>
            <span>${payIcon} ${payLabel}</span>
          </div>
        </div>
        <div style="text-align:right">
          <span class="pill ${STATUS_PILLS[order.status]}">${STATUS_LABELS[order.status]}</span>
          <div class="order-time" style="margin-top:6px">🕐 ${timeAgo(order.date)}</div>
        </div>
      </div>
      <div class="order-card-body">
        <ul class="order-items">${itemsHTML}</ul>
        <div class="order-total">
          <span>Total</span>
          <span>${formatBRL(order.total)}</span>
        </div>
      </div>
      ${footerBtns ? `<div class="order-card-footer">${footerBtns}</div>` : ''}
    </div>
  `;
}

function renderOrders() {
  const board  = document.getElementById('orders-board');
  const empty  = document.getElementById('orders-empty');
  if (!board) return;

  let orders = getOrders().filter(o => o.status === currentTab);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    orders = orders.filter(o =>
      o.student.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    );
  }

  if (filterBlock !== 'all') {
    orders = orders.filter(o => o.block === filterBlock);
  }

  if (orders.length === 0) {
    board.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  board.innerHTML = orders.map(buildOrderCard).join('');
}

function updateTabCounts() {
  const orders = getOrders();
  const counts = { pending: 0, prep: 0, ready: 0, done: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    const s = tab.dataset.tab;
    const badge = tab.querySelector('.count');
    if (badge) {
      badge.textContent = counts[s] || 0;
      badge.style.display = counts[s] > 0 ? 'inline-flex' : 'none';
    }
  });
}

function initTabs() {
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderOrders();
    });
  });
}

function initSearch() {
  const input = document.getElementById('order-search');
  if (!input) return;
  input.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderOrders();
  });
}

function initBlockFilter() {
  const sel = document.getElementById('block-filter');
  if (!sel) return;
  sel.addEventListener('change', e => {
    filterBlock = e.target.value;
    renderOrders();
  });
}

// Auto-refresh simulation every 30s
function startAutoRefresh() {
  setInterval(() => {
    showToast('🔄 Pedidos atualizados', 'info');
    renderOrders();
    updateTabCounts();
  }, 30000);
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSearch();
  initBlockFilter();
  renderOrders();
  updateTabCounts();
  startAutoRefresh();
});
