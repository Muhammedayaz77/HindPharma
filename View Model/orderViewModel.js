import { TempSessionService } from '../temp/temp_file_sessionService.js';

const session = TempSessionService.requireLogin();
if (!session) throw new Error('Login required.');
document.getElementById('user').textContent = session.username;
document.getElementById('logout').onclick = () => { TempSessionService.clear(); location.href='index.html'; };

let order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]');
const list = document.getElementById('list');
document.getElementById('medical').textContent = 'Medical: ' + (localStorage.getItem('hindPharmaMedical') || 'Not selected');
const esc = value => String(value ?? '').replace(/[&<>\'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));
function render(){list.innerHTML=order.length?order.map((item,index)=>`<div class="item"><span>${index+1}. ${esc(item.name)}</span><span class="qty"><button data-action="minus" data-index="${index}">−</button>${item.quantity}<button data-action="plus" data-index="${index}">+</button><button class="remove" data-action="remove" data-index="${index}">×</button></span></div>`).join(''):'<p>Your order is empty.</p>';document.getElementById('next').disabled=!order.length}
function save(){localStorage.setItem('hindPharmaOrder',JSON.stringify(order));render()}
list.addEventListener('click',event=>{const button=event.target.closest('button[data-index]');if(!button)return;const index=Number(button.dataset.index);if(button.dataset.action==='minus')order[index].quantity=Math.max(1,order[index].quantity-1);if(button.dataset.action==='plus')order[index].quantity+=1;if(button.dataset.action==='remove')order.splice(index,1);save()});
document.getElementById('next').onclick=()=>location.href='final-order.html';
render();TempSessionService.startExpiryWatcher(()=>location.replace('login.html'));
