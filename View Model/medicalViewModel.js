import { TempSessionService } from '../temp/temp_file_sessionService.js';

const session = TempSessionService.requireLogin();
if (!session) throw new Error('Login required.');
document.getElementById('user').textContent = session.username;
document.getElementById('logout').onclick = () => { TempSessionService.clear(); location.href = 'index.html'; };

let medicals = [];
const search = document.getElementById('search');
const list = document.getElementById('list');
const esc = value => String(value ?? '').replace(/[&<>\'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));

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
fetch('../data/medicals.json', { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => { medicals = Array.isArray(data) ? data : []; render(); }).catch(() => { list.innerHTML = '<div class="empty">Medical list could not be loaded.</div>'; });
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
