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

function logout() {
  sessionStorage.removeItem('hindPharmaUser');
  localStorage.removeItem('hindPharmaLoginAt');
  localStorage.removeItem('hindPharmaOrder');
  localStorage.removeItem('hindPharmaMedical');
  location.href = 'index.html';
}

if (!validSession()) location.replace('login.html');
document.getElementById('user').textContent = sessionStorage.getItem('hindPharmaUser') || '';
document.getElementById('logout').onclick = logout;

let medicals = [];
const search = document.getElementById('search');
const list = document.getElementById('list');
const esc = value => String(value ?? '').replace(/[&<>\'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function render() {
  const query = search.value.trim().toLowerCase();
  const matches = medicals.filter(item => `${item.name || ''} ${item.area || ''}`.toLowerCase().includes(query));
  list.innerHTML = matches.length ? matches.map((item, index) => `<button class="medical" data-index="${index}">${esc(item.name || '')}${item.area ? `<span class="area">(${esc(item.area)})</span>` : ''}</button>`).join('') : '<div class="empty">No medical found.</div>';
  list.querySelectorAll('.medical').forEach(button => button.addEventListener('click', () => choose(matches[Number(button.dataset.index)])));
}

function choose(medical) {
  const display = medical.area ? `${medical.name} (${medical.area})` : medical.name;
  localStorage.setItem('hindPharmaMedical', display);
  localStorage.removeItem('hindPharmaOrder');
  location.href = 'products.html';
}

search.addEventListener('input', render);
fetch('../data/medicals.json').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => { medicals = Array.isArray(data) ? data : []; render(); }).catch(() => { list.innerHTML = '<div class="empty">Medical list could not be loaded.</div>'; });
setInterval(() => { if (!validSession()) location.replace('login.html'); }, 60000);
