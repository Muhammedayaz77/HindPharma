import { TempSessionService } from '../temp/temp_file_sessionService.js';
import { TempDataService } from '../temp/temp_file_dataService.js';
const session=TempSessionService.requireLogin(); if(!session)throw new Error('Login required.');
document.getElementById('user').textContent=session.username;
document.getElementById('logout').onclick=()=>{TempSessionService.clear();location.href='index.html'};
let order=[];try{order=JSON.parse(localStorage.getItem('hindPharmaOrder')||'[]')}catch(_){order=[]}
if(!order.length){location.replace('products.html');throw new Error('Order is empty.')}
const medicalId=Number(localStorage.getItem('hindPharmaMedicalId'));const medical=localStorage.getItem('hindPharmaMedical')||'MEDICAL NAME';
const text=`*#${medical}*\n\n`+order.map((item,i)=>`${i+1}. ${item.name} ----> ${item.quantity} ${item.unit||'PIECE'}`).join('\n');
document.getElementById('preview').textContent=text;
let submitting=false;
const submitOrder=async()=>{if(submitting)return;submitting=true;try{const items=order.filter(x=>x.productId!=null).map(x=>({product_id:Number(x.productId),quantity:Number(x.quantity),price:x.price??null}));if(items.length!==order.length)throw new Error('A temporary/manual product is in this order. Please remove it and select a catalogue product before submitting.');const result=await new TempDataService().createOrder({medical_id:Number.isFinite(medicalId)?medicalId:null,items});localStorage.removeItem('hindPharmaOrder');alert(`Order #${result.order_id} submitted successfully.`);location.href='index.html'}catch(e){alert(e.message||'Order could not be submitted.');submitting=false}};
const whatsapp=document.getElementById('whatsapp');if(whatsapp)whatsapp.onclick=submitOrder;
document.getElementById('new').onclick=()=>{localStorage.removeItem('hindPharmaOrder');localStorage.removeItem('hindPharmaMedical');localStorage.removeItem('hindPharmaMedicalId');location.href='medical.html'};
TempSessionService.startExpiryWatcher(()=>location.replace('login.html'));
