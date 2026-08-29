import { JsonProductDataSource, ApiProductDataSource } from './dataSource.js';
import { ProductViewModel } from './productViewModel.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-6';

const session = TempSessionService.requireLogin();
if (!session) throw new Error('Login required.');
const medical = localStorage.getItem('hindPharmaMedical');
if (!medical) location.replace('medical.html');
const DEFAULT_IMAGE = '../Assets/Images/hind-pharma-default.svg';
const useApi = false;
const dataSource = useApi ? new ApiProductDataSource(window.HIND_PHARMA_API_URL || '') : new JsonProductDataSource('../data/products.json');
const viewModel = new ProductViewModel(dataSource);
let filtered = [], order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]'), selected = null;
const grid = document.getElementById('grid'), search = document.getElementById('search'), count = document.getElementById('count'), modal = document.getElementById('modal'), qty = document.getElementById('qty');
const esc = value => String(value ?? '').replace(/[&<>\'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));
function updateCart(){document.getElementById('cartBtn').textContent=`Order (${order.length})`}
function render(){grid.innerHTML=filtered.map((product,index)=>`<button class="card" type="button" data-index="${index}" aria-label="Select ${esc(product.name||'product')}"><img class="productImage" src="${esc(product.image||DEFAULT_IMAGE)}" alt="" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'"><span class="productInfo"><span class="name">${esc(product.name||'Unnamed Product')}</span>${product.company?`<span class="company">${esc(product.company)}</span>`:''}${product.formula?`<span class="formula">${esc(product.formula)}</span>`:''}${product.mrp!=null&&product.mrp!==''?`<span class="mrp">MRP: ₹${esc(product.mrp)}</span>`:''}</span><span class="chevron" aria-hidden="true">›</span></button>`).join('')||'<div class="empty">No matching products found.</div>';grid.querySelectorAll('.card').forEach(card=>card.addEventListener('click',()=>openProduct(Number(card.dataset.index)),{once:true}));count.textContent=`${filtered.length} product${filtered.length===1?'':'s'} found`}
async function loadProducts(){try{await viewModel.loadProducts();filtered=viewModel.products;render()}catch(error){count.textContent='Could not load products';grid.innerHTML='<div class="empty">Product data could not be loaded.</div>'}}
async function searchProducts(query){try{filtered=await viewModel.searchProducts(query);render()}catch(error){count.textContent='Search failed'}}
function openProduct(index){selected=filtered[index];if(!selected)return;document.getElementById('modalTitle').textContent=selected.name||'Product';document.getElementById('modalInfo').textContent=[selected.company,selected.formula,selected.mrp!=null?`MRP ₹${selected.mrp}`:''].filter(Boolean).join(' • ');qty.value=1;modal.classList.add('show')}
document.getElementById('minus').onclick=()=>qty.value=Math.max(1,(+qty.value||1)-1);document.getElementById('plus').onclick=()=>qty.value=(+qty.value||1)+1;document.getElementById('cancel').onclick=()=>modal.classList.remove('show');
let adding=false;document.getElementById('add').onclick=()=>{if(adding)return;adding=true;const button=document.getElementById('add');button.disabled=true;const quantity=Math.max(1,parseInt(qty.value,10)||1);if(!selected){adding=false;button.disabled=false;return}const key=`product:${selected.id||selected.name}`,old=order.find(item=>item.key===key);if(old)old.quantity+=quantity;else order.push({key,productId:selected.id,name:selected.name,quantity});localStorage.setItem('hindPharmaOrder',JSON.stringify(order));updateCart();modal.classList.remove('show');setTimeout(()=>{adding=false;button.disabled=false},300)};
let cartOpening=false;document.getElementById('cartBtn').onclick=()=>{if(cartOpening)return;cartOpening=true;document.getElementById('cartBtn').disabled=true;location.href='order.html'};
let searchTimer;search.addEventListener('input',event=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>searchProducts(event.target.value),80)});document.getElementById('intro').textContent=`Ordering for ${medical}. Tap anywhere on a product card to select it.`;updateCart();loadProducts();TempSessionService.startExpiryWatcher(()=>location.replace('login.html'));
