import { JsonProductDataSource, ApiProductDataSource } from './dataSource.js';
import { ProductViewModel } from './productViewModel.js';

const SESSION_HOURS = 12;
const DEFAULT_IMAGE = '../Assets/Images/hind-pharma-default.svg';

function validSession() {
  const user = sessionStorage.getItem('hindPharmaUser');
  const loginAt = Number(localStorage.getItem('hindPharmaLoginAt') || 0);
  if (!user || !loginAt || Date.now() - loginAt >= SESSION_HOURS * 60 * 60 * 1000) {
    sessionStorage.removeItem('hindPharmaUser');
    localStorage.removeItem('hindPharmaLoginAt');
    return false;
  }
  return true;
}

if (!validSession()) location.replace('../login.html');

const medical = localStorage.getItem('hindPharmaMedical');
if (!medical) location.replace('../medical.html');

// Dependency injection: switch only this line when the API/database is ready.
const useApi = false;
const dataSource = useApi
  ? new ApiProductDataSource('https://YOUR-HIND-PHARMA-API.example.com')
  : new JsonProductDataSource('../data/products.json');
const viewModel = new ProductViewModel(dataSource);

let filtered = [];
let order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]');
let selected = null;
const grid = document.getElementById('grid');
const search = document.getElementById('search');
const count = document.getElementById('count');
const modal = document.getElementById('modal');
const qty = document.getElementById('qty');

const esc = (value) => String(value ?? '').replace(/[&<>\'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

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

  grid.innerHTML = cards || '<div class="empty">No matching products found.</div>';
  grid.querySelectorAll('.card').forEach(card => card.addEventListener('click', () => openProduct(Number(card.dataset.index))));
  count.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'} found`;
}

async function loadProducts() {
  try {
    await viewModel.loadProducts();
    filtered = viewModel.products;
    render();
  } catch (error) {
    count.textContent = 'Could not load products';
    grid.innerHTML = '<div class="empty">Product data could not be loaded.</div>';
  }
}

async function searchProducts(query) {
  try {
    filtered = await viewModel.searchProducts(query);
    render();
  } catch (error) {
    count.textContent = 'Search failed';
  }
}

function openProduct(index) {
  selected = filtered[index];
  document.getElementById('modalTitle').textContent = selected.name || 'Product';
  document.getElementById('modalInfo').textContent = [selected.company, selected.formula, selected.mrp != null ? `MRP ₹${selected.mrp}` : ''].filter(Boolean).join(' • ');
  qty.value = 1;
  modal.classList.add('show');
}

document.getElementById('minus').onclick = () => qty.value = Math.max(1, (+qty.value || 1) - 1);
document.getElementById('plus').onclick = () => qty.value = (+qty.value || 1) + 1;
document.getElementById('cancel').onclick = () => modal.classList.remove('show');
document.getElementById('add').onclick = () => {
  const quantity = Math.max(1, parseInt(qty.value, 10) || 1);
  if (!selected) return;
  const key = `product:${selected.id || selected.name}`;
  const old = order.find(item => item.key === key);
  if (old) old.quantity += quantity;
  else order.push({ key, productId: selected.id, name: selected.name, quantity });
  localStorage.setItem('hindPharmaOrder', JSON.stringify(order));
  updateCart();
  modal.classList.remove('show');
};
document.getElementById('cartBtn').onclick = () => location.href = '../order.html';
search.addEventListener('input', event => searchProducts(event.target.value));
document.getElementById('intro').textContent = `Ordering for ${medical || 'selected medical'}. Tap anywhere on a product card to select it.`;
updateCart();
loadProducts();
setInterval(() => { if (!validSession()) location.replace('../login.html'); }, 60000);
