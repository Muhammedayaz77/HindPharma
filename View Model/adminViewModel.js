import { TempDataService } from '../temp/temp_file_dataService.js';

const token = localStorage.getItem('hindPharmaToken');
const role = localStorage.getItem('hindPharmaRole');
const username = localStorage.getItem('hindPharmaUser');
const loginTime = Number(localStorage.getItem('hindPharmaLoginTime') || 0);
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const dataService = new TempDataService();

if (!token || role !== 'admin' || !loginTime || Date.now() - loginTime >= SESSION_DURATION_MS) {
  localStorage.removeItem('hindPharmaUser'); localStorage.removeItem('hindPharmaRole'); localStorage.removeItem('hindPharmaToken'); localStorage.removeItem('hindPharmaLoginTime');
  location.replace('login.html');
}

document.getElementById('adminName').textContent = username ? `Signed in as ${username}` : '';
document.getElementById('logoutButton').addEventListener('click', () => { localStorage.removeItem('hindPharmaUser'); localStorage.removeItem('hindPharmaRole'); localStorage.removeItem('hindPharmaToken'); localStorage.removeItem('hindPharmaLoginTime'); location.replace('login.html'); });

function setMessage(id,text,success=false){const element=document.getElementById(id);element.textContent=text;element.className=`message ${success?'success':'error'}`;}
async function loadCounts(){try{document.getElementById('medicalCount').textContent=(await dataService.getMedicals()).length;}catch(_){document.getElementById('medicalCount').textContent='—';}try{document.getElementById('productCount').textContent=(await dataService.getProducts()).length;}catch(_){document.getElementById('productCount').textContent='—';}}
async function loadUsers(){const table=document.getElementById('usersTable');try{const users=await dataService.getUsers();document.getElementById('userCount').textContent=users.length;table.innerHTML=users.map(user=>`<tr><td>${escapeHtml(user.username)}</td><td><span class="pill ${user.role}">${String(user.role||'user').toUpperCase()}</span></td><td class="active">${user.is_active!==false?'ACTIVE':'INACTIVE'}</td><td>${formatDate(user.created_at)}</td></tr>`).join('')||'<tr><td colspan="4">No users found.</td></tr>';}catch(error){table.innerHTML=`<tr><td colspan="4">${escapeHtml(error.message)}</td></tr>`;}}
document.getElementById('medicalForm').addEventListener('submit',async event=>{event.preventDefault();const name=document.getElementById('medicalName').value.trim();const area=document.getElementById('medicalArea').value.trim();if(!name)return setMessage('medicalMessage','Medical name is required.');try{const existing=await dataService.getMedicals();if(existing.some(item=>String(item.name).toLowerCase()===name.toLowerCase()))throw new Error('Medical already exists.');await dataService.addMedical({id:`MED-TEMP-${Date.now()}`,name,area,is_active:true});event.target.reset();setMessage('medicalMessage','Medical added successfully.',true);loadCounts();}catch(error){setMessage('medicalMessage',error.message);}});
document.getElementById('userForm').addEventListener('submit',async event=>{event.preventDefault();const newUsername=document.getElementById('newUsername').value.trim();const password=document.getElementById('newPassword').value;const newRole=document.getElementById('newRole').value;if(!newUsername)return setMessage('userMessage','Username is required.');if(password.length<8)return setMessage('userMessage','Password must be at least 8 characters.');try{const existing=await dataService.getUsers();if(existing.some(item=>item.username.toLowerCase()===newUsername.toLowerCase()))throw new Error('Username already exists.');await dataService.addUser({id:`USR-TEMP-${Date.now()}`,username:newUsername,password_hash:await dataService.sha256(password),role:newRole,is_active:true,created_at:new Date().toISOString()});event.target.reset();setMessage('userMessage','User created successfully.',true);loadUsers();}catch(error){setMessage('userMessage',error.message);}});
document.getElementById('productForm').addEventListener('submit',async event=>{event.preventDefault();const name=document.getElementById('productName').value.trim();if(!name)return setMessage('productMessage','Product name is required.');try{const existing=await dataService.getProducts();const productId=document.getElementById('productId').value.trim()||`ADM-${Date.now()}`;if(existing.some(item=>String(item.id||'').toLowerCase()===productId.toLowerCase()))throw new Error('Product ID already exists.');await dataService.addProduct({id:productId,code:document.getElementById('productCode').value.trim(),name,unit:document.getElementById('productUnit').value.trim(),mrp:Number(document.getElementById('productMrp').value||0),formula:document.getElementById('productFormula').value.trim(),company:document.getElementById('productCompany').value.trim(),is_active:true});event.target.reset();setMessage('productMessage','Product added successfully.',true);loadCounts();}catch(error){setMessage('productMessage',error.message);}});
document.getElementById('refreshUsers').addEventListener('click',loadUsers);
function escapeHtml(value){return String(value??'').replace(/[&<>\"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[character]));}
function formatDate(value){if(!value)return '—';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):date.toLocaleDateString();}
loadUsers();loadCounts();
