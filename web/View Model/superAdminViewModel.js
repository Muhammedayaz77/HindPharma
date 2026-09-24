import { API_BASE_URL } from '../API/apiConfig.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js';

const session=TempSessionService.requireRole('super_admin');
if(!session)throw new Error('HTG Super Admin login required.');
const $=id=>document.getElementById(id);
$('adminName').textContent='Signed in as '+session.username;
$('logoutButton').onclick=()=>{TempSessionService.clear();location.replace('htg-super-admin-login.html')};
let applications=[],pendingApplication=null;

async function api(path,options={}){
 const headers=new Headers(options.headers||{});
 headers.set('Authorization','Bearer '+session.token);
 if(options.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
 const r=await fetch(API_BASE_URL+path,{...options,headers,cache:'no-store'});
 if(!r.ok){let m='Request failed ('+r.status+')';try{const b=await r.json();m=b.detail||m}catch(_){}throw new Error(m)}
 return r.json();
}
function message(text,success=false){$('message').textContent=text;$('message').className='message '+(success?'success':'')}
function render(){
 const active=applications.filter(a=>a.application_status==='active'&&a.is_active!==false).length;
 const expiring=applications.filter(a=>a.subscription_expiry).length;
 $('adminCount').textContent=applications.length;$('activeCount').textContent=active;$('expiringCount').textContent=expiring;
 $('adminTable').innerHTML=applications.map(a=>{
   const status=a.application_status==='pending_payment'?'PAYMENT PENDING':a.is_active===false?'INACTIVE':'ACTIVE';
   const action=a.application_status==='pending_payment'
     ? '<button class="btn" data-action="pay" data-id="'+a.id+'">PAY & GENERATE</button>'
     : '<button class="btn" data-action="toggle" data-id="'+(a.admin_id||'')+'">'+(a.is_active===false?'ACTIVATE':'DEACTIVATE')+'</button>';
   return '<tr><td><strong>'+(a.business_name||'—')+'</strong><br><small>/shop/'+(a.slug||'—')+'</small></td><td>'+(a.admin_username||'—')+'</td><td>'+(a.subscription_expiry||'—')+'</td><td>'+(a.payment_status||'pending')+'</td><td>'+status+'</td><td class="actions">'+action+'</td></tr>';
 }).join('')||'<tr><td colspan="6">No HTG businesses found.</td></tr>';
}
async function load(){
 try{applications=await api('/super-admin/shop-applications');render()}
 catch(e){message(e.message);$('adminTable').innerHTML='<tr><td colspan="6">Could not load businesses.</td></tr>'}
}
$('createAdminForm').addEventListener('submit',async e=>{
 e.preventDefault();
 try{
   const body={admin_username:$('username').value.trim(),admin_name:$('name').value.trim(),business_name:$('businessName').value.trim(),subtitle:$('subtitle').value.trim()||null,phone:$('phone').value.trim()||null,email:$('email').value.trim()||null,address:$('address').value.trim()||null,dl_20b:$('dl20b').value.trim()||null,dl_21b:$('dl21b').value.trim()||null,fssai:$('fssai').value.trim()||null,gstin:$('gstin').value.trim()||null,barcode:$('barcode').value.trim()||null,logo:$('logo').value.trim()||null,upi:$('upi').value.trim()||null,amount:0};
   pendingApplication=await api('/super-admin/shop-applications',{method:'POST',body:JSON.stringify(body)});
   $('createAdminForm').reset();$('paymentStep').hidden=false;$('paymentMessage').textContent='Payment is pending for '+body.business_name+'.';message('Business application created. Admin will be generated only after payment confirmation.');await load();
 }catch(err){message(err.message)}
});
$('paymentButton').onclick=async()=>{
 if(!pendingApplication)return;
 try{
   const transactionId=prompt('Enter payment transaction/reference ID:');
   if(!transactionId||!transactionId.trim())return;
   const result=await api('/super-admin/shop-applications/'+pendingApplication.application_id+'/payment',{method:'POST',body:JSON.stringify({transaction_id:transactionId.trim(),payment_method:'manual',amount:0})});
   pendingApplication=null;$('paymentStep').hidden=true;
   message('Payment confirmed. Business Admin generated: '+result.username+' / '+result.initial_password,true);await load();
 }catch(err){message(err.message)}
};
$('adminTable').addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 try{
   if(b.dataset.action==='pay'){pendingApplication=applications.find(x=>String(x.id)===String(b.dataset.id));$('paymentStep').hidden=false;$('paymentMessage').textContent='Confirm payment for '+(pendingApplication?.business_name||'this business')+'.';return}
   if(b.dataset.action==='toggle'&&b.dataset.id){const current=applications.find(x=>String(x.admin_id)===String(b.dataset.id));const active=current?.is_active!==false;await api('/admins/'+b.dataset.id+'/status?active='+(!active),{method:'PATCH'});await load()}
 }catch(err){message(err.message)}
});
$('refreshButton').onclick=load;
load();
