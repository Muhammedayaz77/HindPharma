import { LocalFirstProductDataSource } from './dataSource.js';
import { ProductViewModel } from './productViewModel.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-7';

const session = TempSessionService.requireLogin();
if (!session) throw new Error('Login required.');
const medical = localStorage.getItem('hindPharmaMedical');
if (!medical) location.replace('medical.html');

const DEFAULT_IMAGE = '../Assets/Images/hind-pharma-default.svg';
const dataSource = new LocalFirstProductDataSource('../data/products.json');
const viewModel = new ProductViewModel(dataSource);
let filtered = [];
let order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]');
let selected = null;
let manualMode = false;

const grid = document.getElementById('grid');
const search = document.getElementById('search');
const count = document.getElementById('count');
const modal = document.getElementById('modal');
const qty = document.getElementById('qty');
const manualName = document.getElementById('manualName');
const modalTitle = document.getElementById('modalTitle');
const modalInfo = document.getElementById('modalInfo');
const addButton = document.getElementById('add');

const esc = value => String(value ?? '').replace(/[&<>\'\"]/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '\"': '&quot;'
}[char]));

function updateCart() {
  document.getElementById('cartBtn').textContent = `Order (${order.length})`;
}

function render() {
  const cards = filtered.map((product, index) => `
    <button class="card" type="button" data-index="${index}" aria-label="Select ${esc(product.name || 'product')}">
      <img class="productImage" src="${esc(product.image || DEFAULT_IMAGE)}" alt="" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
      <span class="productInfo">
        <span class="name">${esc(product.name || 'Unnamed Product')}</span>
        ${product.company ? `<span class="company">${esc(product.company)}</span>` : ''}
        ${product.formula ? `<span class="formula">${esc(product.formula)}</span>` : ''}
        ${product.mrp != null && product.mrp !== '' ? `<span class="mrp">MRP: ₹${esc(product.mrp)}</span>` : ''}
      </span>
      <span class="chevron" aria-hidden="true">›</span>
    </button>`).join('');

  const manualCard = `
    <div class="manual">
      <strong>Product not found?</strong>
      <p>You can temporarily add a product that is not in the catalogue.</p>
      <button id="manualAdd" type="button">ADD PRODUCT TEMPORARILY</button>
    </div>`;

  grid.innerHTML = cards + manualCard;
  count.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'} found`;

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openProduct(Number(card.dataset.index)), { once: true });
  });
  document.getElementById('manualAdd').addEventListener('click', openManualProduct);
}

async function loadProducts() {
  try {
    await viewModel.loadProducts();
    filtered = viewModel.products;
    render();
  } catch (error) {
    count.textContent = 'Could not load products';
    filtered = [];
    render();
  }
}

async function searchProducts(query) {
  try {
    filtered = await viewModel.searchProducts(query);
    render();
  } catch (error) {
    count.textContent = 'Search failed';
    filtered = [];
    render();
  }
}

function openProduct(index) {
  selected = filtered[index];
  if (!selected) return;

  manualMode = false;
  modalTitle.textContent = selected.name || 'Product';
  modalInfo.textContent = [
    selected.company,
    selected.formula,
    selected.mrp != null ? `MRP ₹${selected.mrp}` : ''
  ].filter(Boolean).join(' • ');
  manualName.style.display = 'none';
  manualName.value = '';
  qty.value = 1;
  addButton.textContent = 'Add to Order';
  modal.classList.add('show');
}

function openManualProduct() {
  manualMode = true;
  selected = null;
  modalTitle.textContent = 'Add Missing Product';
  modalInfo.textContent = 'This product will be added only to your current order. It will not be added to the catalogue.';
  manualName.style.display = 'block';
  manualName.value = search.value.trim();
  qty.value = 1;
  addButton.textContent = 'Add to Order';
  modal.classList.add('show');
  setTimeout(() => manualName.focus(), 0);
}

document.getElementById('minus').onclick = () => {
  qty.value = Math.max(1, (+qty.value || 1) - 1);
};

document.getElementById('plus').onclick = () => {
  qty.value = (+qty.value || 1) + 1;
};

document.getElementById('cancel').onclick = () => {
  modal.classList.remove('show');
  manualName.value = '';
};

let adding = false;
addButton.onclick = () => {
  if (adding) return;

  const quantity = Math.max(1, parseInt(qty.value, 10) || 1);
  let name;
  let key;

  if (manualMode) {
    name = manualName.value.trim();
    if (!name) {
      manualName.focus();
      return;
    }
    key = `manual:${name.toLowerCase()}`;
  } else {
    if (!selected) return;
    name = selected.name || 'Unnamed Product';
    key = `product:${selected.id || name}`;
  }

  adding = true;
  addButton.disabled = true;

  const old = order.find(item => item.key === key);
  if (old) old.quantity += quantity;
  else order.push({
    key,
    productId: manualMode ? null : selected.id,
    name,
    quantity,
    temporary: manualMode
  });

  localStorage.setItem('hindPharmaOrder', JSON.stringify(order));
  updateCart();
  modal.classList.remove('show');
  manualName.value = '';

  setTimeout(() => {
    adding = false;
    addButton.disabled = false;
  }, 300);
};

let cartOpening = false;
document.getElementById('cartBtn').onclick = () => {
  if (cartOpening) return;
  cartOpening = true;
  document.getElementById('cartBtn').disabled = true;
  location.href = 'order.html';
};

let searchTimer;
search.addEventListener('input', event => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchProducts(event.target.value), 80);
});

document.getElementById('intro').textContent = `Ordering for ${medical}. Tap anywhere on a product card to select it.`;
updateCart();
loadProducts();
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
