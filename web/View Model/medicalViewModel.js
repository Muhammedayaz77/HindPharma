import { TempSessionService } from '../temp/temp_file_sessionService.js';
import { TempDataService } from '../temp/temp_file_dataService.js';
const session=TempSessionService.requireRole('admin','manager','employee'); if(!session) throw new Error('Login required.');
const service=new TempDataService(); document.getElementById('user').textContent=session.username;
document.getElementById('logout').onclick=()=>{TempSessionService.clear();location.href='index.html'};
let medicals=[]; const search=document.getElementById('search'),list=document.getElementById('list');
const esc=value=>String(value??'').replace(/[&<>\'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
function render(){const q=search.value.trim().toLowerCase();const matches=medicals.filter(x=>`${x.name||''} ${x.area||''}`.toLowerCase().includes(q));list.innerHTML=matches.length?matches.map((m,i)=>`<button class="medical" type="button" data-index="${i}"><span class="medicalName">${esc(m.name||'')}</span>${m.area?`<span class="area">(${esc(m.area)})</span>`:''}</button>`).join(''):'<div class="empty">No medical found.</div>';list.querySelectorAll('.medical').forEach(b=>b.addEventListener('click',()=>choose(matches[Number(b.dataset.index)]),{once:true}))}
function choose(m){if(!m)return;localStorage.setItem('hindPharmaMedicalId',String(m.id));localStorage.setItem('hindPharmaMedical',m.area?`${m.name} (${m.area})`:m.name);localStorage.removeItem('hindPharmaOrder');location.href='products.html'}
async function load(){try{medicals=await service.getMedicals();render()}catch(e){list.innerHTML=`<div class="empty">${esc(e.message||'Medical list could not be loaded.')}</div>`}}
search.addEventListener('input',render);load();TempSessionService.startExpiryWatcher(()=>location.replace('login.html'));
