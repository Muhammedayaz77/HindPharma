import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-1';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-1';

const session = TempSessionService.requireRole('admin');
if (!session) { location.replace('login.html'); throw new Error('Admin login required.'); }
const service = new TempDataService();
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const confirmDelete = (type, name) => window.confirm(`Once deleted, this data can't be reverted.\n\nAre you sure you want to delete this ${type}?\n\n${name}`);
function msg(id,text,ok=false){$(id).textContent=text;$(id).className=`message ${ok?'success':'error'}`;}

let medicals=[],products=[],users=[];
function renderMedicals(){const q=$('medicalSearch').value.trim().toLowerCase();const rows=medicals.filter(x=>`${x.name} ${x.area||''}`.toLowerCase().includes(q));$('medicalTable').innerHTML=rows.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.area||'—')}</td><td><button class="btn danger" data-medical="${encodeURIComponent(JSON.stringify(x))}">DELETE</button></td></tr>`).join('')||'<tr><td colspan="3">No matching medicals found.</td></tr>';}
function renderProducts(){const q=$('productSearch').value.trim().toLowerCase();const rows=products.filter(x=>`${x.name||''} ${x.code||''} ${x.id||''} ${x.company||''} ${x.formula||''}`.toLowerCase().includes(q));$('productTable').innerHTML=rows.map(x=>`<tr><td><strong>${esc(x.name||'Unnamed')}</strong></td><td>${esc(x.code||x.id||'—')}</td><td><button class="btn danger" data-product="${encodeURIComponent(JSON.stringify(x))}">DELETE</button></td></tr>`).join('')||'<tr><td colspan="3">No matching products found.</td></tr>';}
function renderUsers(){const q=$('userSearch').value.trim().toLowerCase();const rows=users.filter(x=>`${x.username||''} ${x.role||''}`.toLowerCase().includes(q));$('userTable').innerHTML=rows.map(x=>{const current=x.username.toLowerCase()===session.username.toLowerCase();return `<tr><td><strong>${esc(x.username)}</strong></td><td><span class="pill ${x.role}">${esc(String(x.role||'employee').toUpperCase())}</span></td><td class="active">${x.is_active===false?'INACTIVE':'ACTIVE'}</td><td>${current?'<span class="protected">CURRENT</span>':`<button class="btn danger" data-user="${encodeURIComponent(JSON.stringify(x))}">DELETE</button>`}</td></tr>`;}).join('')||'<tr><td colspan="4">No matching users found.</td></tr>';}
async function load(){try{[medicals,products,users]=await Promise.all([service.getMedicals(),service.getProducts(),service.getUsers()]);renderMedicals();renderProducts();renderUsers();}catch(error){msg('medicalMessage',error.message);}}
$('medicalSearch').addEventListener('input',renderMedicals);$('productSearch').addEventListener('input',renderProducts);$('userSearch').addEventListener('input',renderUsers);
$('medicalTable').addEventListener('click',async event=>{const button=event.target.closest('[data-medical]');if(!button)return;const item=JSON.parse(decodeURIComponent(button.dataset.medical));if(!confirmDelete('medical',item.name))return;await service.deleteMedical(item);msg('medicalMessage','Medical deleted permanently.',true);await load();});
$('productTable').addEventListener('click',async event=>{const button=event.target.closest('[data-product]');if(!button)return;const item=JSON.parse(decodeURIComponent(button.dataset.product));if(!confirmDelete('product',item.name||item.id))return;await service.deleteProduct(item);msg('productMessage','Product deleted permanently.',true);await load();});
$('userTable').addEventListener('click',async event=>{const button=event.target.closest('[data-user]');if(!button)return;const item=JSON.parse(decodeURIComponent(button.dataset.user));if(!confirmDelete('user',item.username))return;await service.deleteUser(item);msg('userMessage','User deleted permanently.',true);await load();});
TempSessionService.startExpiryWatcher(()=>location.replace('login.html'));
load();
