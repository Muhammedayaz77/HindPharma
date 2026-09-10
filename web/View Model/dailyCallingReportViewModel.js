import { API_BASE_URL } from '../API/apiConfig.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-2';

const session = TempSessionService.requireRole('admin');
if (!session) throw new Error('Admin login required.');

document.getElementById('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });
const report = document.getElementById('report');

function esc(value) { return String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }
function render(rows) {
  if (!rows.length) { report.innerHTML = '<div class="card">No calling records or medicals available today.</div>'; return; }
  report.innerHTML = `<div style="overflow:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:10px">Medical</th><th style="text-align:left;padding:10px">Mobile</th><th style="text-align:left;padding:10px">Employee</th><th style="text-align:left;padding:10px">Called</th><th style="text-align:left;padding:10px">Result</th><th style="text-align:left;padding:10px">Last Call</th></tr></thead><tbody>${rows.map(row => `<tr><td style="padding:10px;border-top:1px solid #ddd">${esc(row.name)}</td><td style="padding:10px;border-top:1px solid #ddd">${row.phone ? esc(row.phone) : '—'}</td><td style="padding:10px;border-top:1px solid #ddd">${esc(row.employee || '—')}</td><td style="padding:10px;border-top:1px solid #ddd">${row.call_count > 0 ? '✓' : '—'}</td><td style="padding:10px;border-top:1px solid #ddd">${row.is_pick ? 'Picked' : row.is_not_pick ? 'Not Picked' : 'Pending'}</td><td style="padding:10px;border-top:1px solid #ddd">${esc(row.last_called_at || '—')}</td></tr>`).join('')}</tbody></table></div>`;
}

async function load() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/calling/report`, { headers:{Authorization:`Bearer ${session.token}`}, cache:'no-store' });
    if (!response.ok) throw new Error();
    render(await response.json());
  } catch (_) { report.innerHTML = '<div class="card">Calling report could not be loaded.</div>'; }
}

TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
load();
