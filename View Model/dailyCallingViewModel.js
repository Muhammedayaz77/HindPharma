import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-5';
import { TenantService } from './tenantService.js?v=20260901-1';
import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-5';

const session = TempSessionService.requireRole('admin','manager','employee');
if (!session) throw new Error('Login required.');
const tenant = TenantService.current();
const service = new TempDataService();
const COOLDOWN_MS = 10000;
const key = `hindPharmaCalling_${tenant.id}`;

const $ = id => document.getElementById(id);
$('shopName').textContent = tenant.business_name;
$('shopSubtitle').textContent = tenant.subtitle || 'DAILY CALLING';
$('logoutButton').onclick = () => { TempSessionService.clear(); location.replace('login.html'); };

function logs() {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
}
function save(items) { localStorage.setItem(key, JSON.stringify(items)); }
function today() { return new Date().toISOString().slice(0,10); }
function lastCall(medicalId) { return logs().filter(x => Number(x.medical_id) === Number(medicalId)).sort((a,b) => new Date(b.called_at)-new Date(a.called_at))[0]; }

async function render() {
  const list = $('callingList');
  try {
    const medicals = await service.getMedicals();
    const tenantMedicals = medicals.filter(m => Number(m.admin_id || tenant.id) === Number(tenant.id));
    if (!tenantMedicals.length) { list.innerHTML = '<p>No medicals are available for today.</p>'; return; }
    list.innerHTML = tenantMedicals.map(m => {
      const log = lastCall(m.id);
      const picked = log?.is_pick === true ? 'Picked' : log?.is_pick === false ? 'Not Picked' : 'Pending';
      const called = Boolean(log?.is_call);
      return `<article class="card callingRow"><div><strong>${m.name}</strong><div>${m.area || ''}</div><div class="callingStatus">${called ? '✓ Called' : 'Not Called'} · ${picked}</div></div><a class="btn primary callLink" data-id="${m.id}" data-phone="${m.phone || ''}" href="${m.phone ? `tel:${String(m.phone).replace(/[^0-9+]/g,'')}` : '#'}">${m.phone || 'No mobile number'}</a><div class="pickControls" data-medical="${m.id}" style="display:${called ? 'flex' : 'none'}"><label><input type="radio" name="pick-${m.id}" value="pick" ${log?.is_pick === true ? 'checked' : ''}> Picked</label><label><input type="radio" name="pick-${m.id}" value="not-pick" ${log?.is_pick === false ? 'checked' : ''}> Not Picked</label></div></article>`;
    }).join('');
    list.querySelectorAll('.callLink').forEach(link => link.addEventListener('click', event => {
      const medicalId = Number(link.dataset.id);
      const phone = link.dataset.phone;
      if (!phone) { event.preventDefault(); return; }
      const recent = logs().filter(x => Number(x.employee_id) === Number(session.id) && Date.now() - new Date(x.called_at).getTime() < COOLDOWN_MS);
      if (recent.length) { event.preventDefault(); alert('Please wait 10 seconds before the next call.'); return; }
      const now = new Date().toISOString();
      const items = logs();
      items.push({ id: `CALL-${Date.now()}`, tenant_id: tenant.id, admin_id: session.admin_id, medical_id: medicalId, employee_id: session.id, called_at: now, is_call: true, is_pick: null });
      save(items);
      setTimeout(render, 0);
    }));
    list.querySelectorAll('.pickControls input').forEach(input => input.addEventListener('change', event => {
      const medicalId = Number(event.target.closest('.pickControls').dataset.medical);
      const items = logs().map(item => Number(item.medical_id) === medicalId && String(item.employee_id) === String(session.id) && item.is_call ? {...item, is_pick: event.target.value === 'pick'} : item);
      save(items); render();
    }));
  } catch (_) { list.innerHTML = '<p>Calling list could not be loaded.</p>'; }
}
render();
