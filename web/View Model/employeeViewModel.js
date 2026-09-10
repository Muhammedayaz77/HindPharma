import { API_BASE_URL } from '../API/apiConfig.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-2';

const session = TempSessionService.requireRole('employee');
if (!session) throw new Error('Employee login required.');

const $ = id => document.getElementById(id);
$('employeeName').textContent = `Signed in as ${session.username}`;
$('businessName').textContent = session.business_name || 'Business workspace';
$('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });

const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));
const tokenHeaders = () => ({ 'Authorization': `Bearer ${session.token}` });

function showCooldown(message = '') {
  const box = $('cooldownMessage');
  if (!message) { box.style.display = 'none'; box.textContent = ''; return; }
  box.textContent = message;
  box.style.display = 'block';
}

function render(rows) {
  const list = $('callingList');
  if (!rows.length) {
    list.innerHTML = '<div class="card">No medicals available for today.</div>';
    return;
  }
  list.innerHTML = rows.map(item => `
    <article class="card" style="margin-top:12px" data-medical-id="${item.id}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div><h3 style="margin:0">${escapeHtml(item.name)}</h3><div style="opacity:.75">${escapeHtml(item.area || '')}</div></div>
        <div>${item.phone ? `<a class="btn primary callLink" href="tel:${escapeHtml(item.phone)}" data-id="${item.id}" data-phone="${escapeHtml(item.phone)}">CALL ${escapeHtml(item.phone)}</a>` : '<span>No mobile number</span>'}</div>
      </div>
      <div style="margin-top:12px;display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        <label><input type="radio" name="status-${item.id}" value="pick" ${item.is_pick ? 'checked' : ''} ${!item.is_call ? 'disabled' : ''}> Picked</label>
        <label><input type="radio" name="status-${item.id}" value="not_pick" ${item.is_not_pick ? 'checked' : ''} ${!item.is_call ? 'disabled' : ''}> Not Picked</label>
        <span class="callFlag" aria-label="call status">${item.is_call ? '✓ Called' : ''}</span>
      </div>
    </article>`).join('');

  list.querySelectorAll('.callLink').forEach(link => link.addEventListener('click', async event => {
    event.preventDefault();
    const medicalId = Number(link.dataset.id);
    link.setAttribute('aria-disabled','true');
    link.style.pointerEvents = 'none';
    try {
      const response = await fetch(`${API_BASE_URL}/calling/${medicalId}/call`, { method:'POST', headers: tokenHeaders() });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        showCooldown(data.detail || 'Unable to record the call.');
        link.style.pointerEvents = '';
        return;
      }
      showCooldown(`Call recorded. Next call is available after ${data.cooldown_seconds} seconds.`);
      window.location.href = link.href;
      const flag = link.closest('article').querySelector('.callFlag');
      if (flag) flag.textContent = '✓ Called';
      link.closest('article').querySelectorAll('input[type="radio"]').forEach(input => { input.disabled = false; });
      setTimeout(showCooldown, data.cooldown_seconds * 1000);
    } catch (_) {
      showCooldown('Server is unavailable. Please try again.');
      link.style.pointerEvents = '';
    }
  }));

  list.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change', async event => {
    const medicalId = Number(input.closest('[data-medical-id]').dataset.medicalId);
    try {
      const response = await fetch(`${API_BASE_URL}/calling/${medicalId}/status`, {
        method:'PATCH', headers:{...tokenHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({is_pick:event.target.value === 'pick'})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) showCooldown(data.detail || 'Unable to save call status.');
    } catch (_) { showCooldown('Server is unavailable.'); }
  }));
}

async function load() {
  try {
    const response = await fetch(`${API_BASE_URL}/calling/today`, { headers: tokenHeaders(), cache:'no-store' });
    if (!response.ok) throw new Error();
    render(await response.json());
  } catch (_) {
    $('callingList').innerHTML = '<div class="card">Calling list could not be loaded.</div>';
  }
}

const warningResponse = await fetch(`${API_BASE_URL}/subscription-warning`, { headers: tokenHeaders(), cache:'no-store' }).catch(() => null);
if (warningResponse?.ok) {
  const warning = await warningResponse.json();
  if (warning.show) $('subscriptionWarning').innerHTML = `<div class="card warning" style="margin:16px 0">⚠️ Subscription expires in ${warning.days_remaining} day${warning.days_remaining === 1 ? '' : 's'} (${warning.expiry}).</div>`;
}

TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
load();
