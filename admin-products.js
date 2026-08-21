/* ===================================
   UPFOOD ADMIN — Products / Stock
   =================================== */

'use strict';

let editingId = null;
let productSearch = '';
let productCategory = 'all';

function getProducts() { return DB.get('products') || []; }
function setProducts(p) { DB.set('products', p); }

function stockClass(qty) {
  if (qty === 0) return 'low';
  if (qty <= 5)  return 'mid';
  return 'ok';
}

function stockPill(qty) {
  if (qty === 0) return '<span class="pill low-stock">Sem estoque</span>';
  if (qty <= 5)  return `<span class="pill" style="background:#FEF3C7;color:#D97706">${qty} restantes</span>`;
  return `<span class="pill ok-stock">${qty} un.</span>`;
}

function stockBarWidth(qty) {
  const max = 60;
  return Math.min(100, Math.round((qty / max) * 100));
}

function buildProductRow(p) {
  const cls  = stockClass(p.stock);
  const w    = stockBarWidth(p.stock);

  return `
    <tr data-id="${p.id}">
      <td>
        <div class="product-cell">
          <img class="product-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/42x42?text=UP'">
          <div>
            <div class="td-main">${p.name}</div>
            <div class="td-sub">${p.category}</div>
          </div>
        </div>
      </td>
      <td><span class="pill" style="background:var(--orange-soft);color:var(--orange)">${p.category}</span></td>
      <td>
        <div class="stock-bar-wrap">
          <div class="stock-bar">
            <div class="stock-bar-fill ${cls}" style="width:${w}%"></div>
          </div>
          ${stockPill(p.stock)}
        </div>
      </td>
      <td class="fw-bold text-orange">${formatBRL(p.price)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-icon" title="Editar" onclick="editProduct('${p.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon" title="Ajustar estoque" onclick="adjustStock('${p.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button class="btn-icon" style="color:var(--red)" title="Excluir" onclick="deleteProduct('${p.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderProducts() {
  const tbody = document.getElementById('products-tbody');
  const empty = document.getElementById('products-empty');
  if (!tbody) return;

  let products = getProducts();

  if (productSearch) {
    const q = productSearch.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (productCategory !== 'all') {
    products = products.filter(p => p.category === productCategory);
  }

  if (products.length === 0) {
    tbody.innerHTML = '';
    empty && empty.classList.remove('hidden');
    return;
  }

  empty && empty.classList.add('hidden');
  tbody.innerHTML = products.map(buildProductRow).join('');

  // Update summary stats
  const total  = getProducts().length;
  const outOf  = getProducts().filter(p => p.stock === 0).length;
  const low    = getProducts().filter(p => p.stock > 0 && p.stock <= 5).length;

  const el = document.getElementById('stock-summary');
  if (el) el.textContent = `${total} produtos · ${outOf} sem estoque · ${low} com estoque baixo`;
}

function editProduct(id) {
  editingId = id;
  const p = getProducts().find(p => p.id === id);
  if (!p) return;

  document.getElementById('modal-title').textContent = 'Editar Produto';
  document.getElementById('prod-name').value     = p.name;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-price').value    = p.price;
  document.getElementById('prod-stock').value    = p.stock;
  document.getElementById('prod-image').value    = p.image;

  openModal('product-modal');
}

window.editProduct = editProduct;

function deleteProduct(id) {
  confirmAction('Excluir este produto do cardápio?', () => {
    const products = getProducts().filter(p => p.id !== id);
    setProducts(products);
    renderProducts();
    showToast('Produto excluído com sucesso', 'success');
  });
}

window.deleteProduct = deleteProduct;

function adjustStock(id) {
  const p = getProducts().find(p => p.id === id);
  if (!p) return;
  const qty = prompt(`Ajustar estoque de "${p.name}"\nQuantidade atual: ${p.stock}\n\nNova quantidade:`, p.stock);
  if (qty === null) return;
  const n = parseInt(qty);
  if (isNaN(n) || n < 0) { showToast('Quantidade inválida', 'error'); return; }

  const products = getProducts();
  const idx = products.findIndex(pr => pr.id === id);
  products[idx].stock = n;
  setProducts(products);
  renderProducts();
  showToast(`Estoque de "${p.name}" atualizado para ${n} un.`, 'success');
}

window.adjustStock = adjustStock;

function openNewProduct() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Novo Produto';
  document.getElementById('product-form').reset();
  openModal('product-modal');
}

window.openNewProduct = openNewProduct;

function saveProduct() {
  const name     = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value;
  const price    = parseFloat(document.getElementById('prod-price').value);
  const stock    = parseInt(document.getElementById('prod-stock').value);
  const image    = document.getElementById('prod-image').value.trim();

  if (!name || !category || isNaN(price) || isNaN(stock)) {
    showToast('Preencha todos os campos obrigatórios', 'error');
    return;
  }

  const products = getProducts();

  if (editingId) {
    const idx = products.findIndex(p => p.id === editingId);
    if (idx >= 0) {
      products[idx] = { ...products[idx], name, category, price, stock, image: image || products[idx].image };
    }
    showToast('Produto atualizado com sucesso', 'success');
  } else {
    products.push({
      id: 'prod' + Date.now(),
      name, category, price, stock,
      image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop',
    });
    showToast('Produto adicionado ao cardápio', 'success');
  }

  setProducts(products);
  closeModal('product-modal');
  renderProducts();
}

window.saveProduct = saveProduct;

function initProductSearch() {
  const input = document.getElementById('product-search');
  if (!input) return;
  input.addEventListener('input', e => {
    productSearch = e.target.value.trim();
    renderProducts();
  });
}

function initCategoryFilter() {
  const sel = document.getElementById('cat-filter');
  if (!sel) return;
  sel.addEventListener('change', e => {
    productCategory = e.target.value;
    renderProducts();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initProductSearch();
  initCategoryFilter();
  renderProducts();
});
