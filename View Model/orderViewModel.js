const SESSION_HOURS = 12;

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
function clearSession() { sessionStorage.removeItem('hindPharmaUser'); localStorage.removeItem('hindPharmaLoginAt'); localStorage.removeItem('hindPharmaOrder'); localStorage.removeItem('hindPharmaMedical'); location.href='index.html'; }
if (!validSession()) location.replace('login.html');
document.getElementById('user').textContent = sessionStorage.getItem('hindPharmaUser') || '';
document.getElementById('logout').onclick = clearSession;

let order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]');
const list = document.getElementById('list');
document.getElementById('medical').textContent = 'Medical: ' + (localStorage.getItem('hindPharmaMedical') || 'Not selected');
const esc = value => String(value ?? '').replace(/[&<>\'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
function render() {
  list.innerHTML = order.length ? order.map((item,index)=>`<div class="item"><span>${index+1}. ${esc(item.name)}</span><span class="qty"><button data-action="minus" data-index="${index}">−</button>${item.quantity}<button data-action="plus" data-index="${index}">+</button><button class="remove" data-action="remove" data-index="${index}">×</button></span></div>`).join('') : '<p>Your order is empty.</p>';
  document.getElementById('next').disabled = !order.length;
}
function save(){ localStorage.setItem('hindPharmaOrder',JSON.stringify(order)); render(); }
list.addEventListener('click', event => { const button=event.target.closest('button[data-index]'); if(!button)return; const index=Number(button.dataset.index); if(button.dataset.action==='minus') order[index].quantity=Math.max(1,order[index].quantity-1); if(button.dataset.action==='plus') order[index].quantity+=1; if(button.dataset.action==='remove') order.splice(index,1); save(); });
document.getElementById('next').onclick=()=>location.href='final-order.html';
render();
setInterval(()=>{if(!validSession())location.replace('login.html')},60000);
