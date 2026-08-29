import { API_BASE_URL, USE_LOCAL_API } from '../API/apiConfig.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-7';

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
  list.innerHTML = matches.length ? matches.map((item, index) => `<button class="medical" type="button" data-index="${index}">${esc(item.name || '')}${item.area ? `<span class="area">(${esc(item.area)})</span>` : ''}</button>`).join('') : '<div class="empty">No medical found.</div>';
  list.querySelectorAll('.medical').forEach(button => button.addEventListener('click', () => choose(matches[Number(button.dataset.index)]), {once:true}));
}
function choose(medical) {
  const display = medical.area ? `${medical.name} (${medical.area})` : medical.name;
  localStorage.setItem('hindPharmaMedical', display);
  localStorage.removeItem('hindPharmaOrder');
  location.href = 'products.html';
}
async function loadMedicals() {
  if (USE_LOCAL_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/medicals`, {cache:'no-store'});
      if (response.ok) { medicals = await response.json(); render(); return; }
    } catch (_) {}
  }
  try {
    const response = await fetch('../data/medicals.json', {cache:'no-store'});
    if (!response.ok) throw new Error();
    medicals = await response.json();
    render();
  } catch (_) { list.innerHTML = '<div class="empty">Medical list could not be loaded.</div>'; }
}
search.addEventListener('input', render);
loadMedicals();
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
