/* ===================================
   UPFOOD ADMIN — Core Utilities
   =================================== */

'use strict';

// ─── Toast Notifications ─────────────────────────────────────────────────────

const toastTypes = {
  success: { icon: '✅', border: '#16A34A' },
  error:   { icon: '❌', border: '#DC2626' },
  info:    { icon: 'ℹ️',  border: '#2563EB' },
  warning: { icon: '⚠️', border: '#D97706' },
  order:   { icon: '🛎️', border: '#FF6A00' },
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const t = toastTypes[type] || toastTypes.success;
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.borderLeft = `3px solid ${t.border}`;
  el.innerHTML = `
    <span class="toast-icon">${t.icon}</span>
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

window.showToast = showToast;

// ─── Live Clock ───────────────────────────────────────────────────────────────

function startClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

// ─── Sidebar Mobile Toggle ────────────────────────────────────────────────────

function initSidebar() {
  const toggle  = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay && overlay.classList.toggle('open');
  });

  overlay && overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// ─── Modal Helpers ────────────────────────────────────────────────────────────

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

window.openModal  = openModal;
window.closeModal = closeModal;

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function confirmAction(message, callback) {
  if (window.confirm(message)) callback();
}
window.confirmAction = confirmAction;

// ─── Format Helpers ───────────────────────────────────────────────────────────

function formatBRL(val) {
  return 'R$ ' + Number(val).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

window.formatBRL  = formatBRL;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.timeAgo    = timeAgo;

// ─── Storage Helpers ──────────────────────────────────────────────────────────

const DB = {
  get(key, def = null) {
    const v = localStorage.getItem('upfood_admin_' + key);
    return v ? JSON.parse(v) : def;
  },
  set(key, val) {
    localStorage.setItem('upfood_admin_' + key, JSON.stringify(val));
  },
};

window.DB = DB;

// ─── Seed fake orders if empty ────────────────────────────────────────────────

const STUDENTS = [
  { name: 'Lucas Oliveira',     email: 'lucas.oliveira@up.edu.br',     rgm: '2021001' },
  { name: 'Mariana Costa',      email: 'mariana.costa@up.edu.br',      rgm: '2021042' },
  { name: 'Rafael Souza',       email: 'rafael.souza@up.edu.br',       rgm: '2020178' },
  { name: 'Gabriela Lima',      email: 'gabriela.lima@up.edu.br',      rgm: '2022003' },
  { name: 'Thiago Ferreira',    email: 'thiago.ferreira@up.edu.br',    rgm: '2019221' },
  { name: 'Julia Martins',      email: 'julia.martins@up.edu.br',      rgm: '2023011' },
  { name: 'Pedro Carvalho',     email: 'pedro.carvalho@up.edu.br',     rgm: '2020099' },
  { name: 'Ana Paula Ribeiro',  email: 'ana.ribeiro@up.edu.br',        rgm: '2021088' },
  { name: 'Bruno Alves',        email: 'bruno.alves@up.edu.br',        rgm: '2022045' },
  { name: 'Camila Nunes',       email: 'camila.nunes@up.edu.br',       rgm: '2020132' },
];

const BLOCKS = ['Vermelho','Azul','Bege','Amarelo','Marrom','Sul'];
const STATUSES = ['pending','prep','ready','done'];

const MENU_ITEMS = [
  { name: 'X-Burger Clássico',    price: 18.90 },
  { name: 'Suco Natural Laranja', price: 8.90  },
  { name: 'Coxinha de Frango',    price: 6.50  },
  { name: 'Cappuccino',           price: 9.90  },
  { name: 'Pão de Queijo',        price: 4.50  },
  { name: 'X-Tudo Especial',      price: 24.90 },
  { name: 'Batata Frita Grande',  price: 14.90 },
  { name: 'Açaí 500ml',          price: 19.90 },
  { name: 'Prato Executivo',      price: 29.90 },
  { name: 'Salada Caesar',        price: 22.90 },
  { name: 'Pizza Margherita',     price: 12.90 },
  { name: 'Brownie',              price: 7.90  },
  { name: 'Milkshake Chocolate',  price: 15.90 },
  { name: 'Hot Dog Completo',     price: 14.90 },
  { name: 'Wrap de Frango',       price: 19.90 },
];

const PAY_METHODS = ['pix','cartao','vr','dinheiro','na_hora'];
const PAY_LABELS  = { pix:'PIX', cartao:'Cartão', vr:'VR/VA', dinheiro:'Dinheiro', na_hora:'Na hora' };

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function seedOrders() {
  if (DB.get('orders')) return;
  const orders = [];
  const now = Date.now();

  for (let i = 0; i < 40; i++) {
    const student = pick(STUDENTS);
    const numItems = randInt(1, 3);
    const items = [];
    for (let j = 0; j < numItems; j++) {
      const mi = pick(MENU_ITEMS);
      items.push({ ...mi, quantity: randInt(1, 2) });
    }
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const status = i < 5 ? 'pending' : i < 12 ? 'prep' : i < 18 ? 'ready' : 'done';
    const date = new Date(now - randInt(0, 14) * 86400000 - randInt(0, 86400000)).toISOString();

    orders.push({
      id: 'PED-' + (10000 + i).toString(36).toUpperCase(),
      student: student.name,
      email: student.email,
      rgm: student.rgm,
      block: pick(BLOCKS),
      cantina: 'Cantina Central',
      items,
      total,
      status,
      paymentMethod: pick(PAY_METHODS),
      date,
    });
  }
  DB.set('orders', orders);
}

function seedProducts() {
  if (DB.get('products')) return;
  const products = [
    { id:'prod1', name:'X-Burger Clássico',   category:'Lanches',   price:18.90, stock:24, image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop' },
    { id:'prod2', name:'Suco Natural Laranja', category:'Bebidas',   price:8.90,  stock:50, image:'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=80&h=80&fit=crop' },
    { id:'prod3', name:'Coxinha de Frango',    category:'Salgados',  price:6.50,  stock:3,  image:'https://images.unsplash.com/photo-1598142982901-df6cec890505?w=80&h=80&fit=crop' },
    { id:'prod4', name:'Cappuccino',           category:'Bebidas',   price:9.90,  stock:40, image:'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=80&h=80&fit=crop' },
    { id:'prod5', name:'Pão de Queijo',        category:'Salgados',  price:4.50,  stock:60, image:'https://images.unsplash.com/photo-1598142982901-df6cec890505?w=80&h=80&fit=crop' },
    { id:'prod6', name:'X-Tudo Especial',      category:'Lanches',   price:24.90, stock:12, image:'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=80&h=80&fit=crop' },
    { id:'prod7', name:'Batata Frita Grande',  category:'Salgados',  price:14.90, stock:8,  image:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=80&h=80&fit=crop' },
    { id:'prod8', name:'Açaí 500ml',          category:'Açaí',      price:19.90, stock:20, image:'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=80&h=80&fit=crop' },
    { id:'prod9', name:'Prato Executivo',      category:'Refeições', price:29.90, stock:15, image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop' },
    { id:'prod10',name:'Brownie',              category:'Doces',     price:7.90,  stock:5,  image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=80&h=80&fit=crop' },
    { id:'prod11',name:'Milkshake Chocolate',  category:'Bebidas',   price:15.90, stock:18, image:'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=80&h=80&fit=crop' },
    { id:'prod12',name:'Salada Caesar',        category:'Refeições', price:22.90, stock:0,  image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&h=80&fit=crop' },
  ];
  DB.set('products', products);
}

function seedClients() {
  if (DB.get('clients')) return;
  const orders = DB.get('orders') || [];
  const clients = STUDENTS.map((s, i) => {
    const lastOrder = orders.filter(o => o.email === s.email).sort((a,b) => b.date < a.date ? -1 : 1)[0];
    return {
      ...s,
      status: i % 7 === 0 ? 'inactive' : 'active',
      vip: i % 3 === 0,
      orderCount: randInt(1, 25),
      totalSpent: randInt(50, 800) + .90,
      lastOrder: lastOrder ? lastOrder.date : new Date(Date.now() - randInt(1,30) * 86400000).toISOString(),
    };
  });
  DB.set('clients', clients);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  seedOrders();
  seedProducts();
  seedClients();
  startClock();
  initSidebar();
});
