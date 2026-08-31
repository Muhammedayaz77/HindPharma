import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-1';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-1';

const session = TempSessionService.requireRole('super_admin');
if (!session) throw new Error('Super Admin login required.');

const service = new TempDataService();
const $ = id => document.getElementById(id);
$('adminName').textContent = `Signed in as ${session.username}`;
$('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });

function message(text, success = false) { $('message').textContent = text; $('message').style.color = success ? 'inherit' : ''; }
function confirmPermanentDelete(name) {
  return window.confirm(`Once deleted, this data can't be reverted.\n\nAre you sure you want to delete ${name}?`);
}

function render(accounts) {
  const admins = accounts.filter(account => account.role === 'admin');
  const active = admins.filter(account => account.is_active !== false).length;
  const expiring = admins.filter(account => service.getSubscriptionWarning(account)).length;
  $('adminCount').textContent = admins.length;
  $('activeCount').textContent = active;
  $('expiringCount').textContent = expiring;
  $('adminTable').innerHTML = admins.map(admin => {
    const warning = service.getSubscriptionWarning(admin);
    return `<tr><td><strong>${admin.business_name}</strong></td><td>${admin.username}</td><td>${warning ? `<span class="warning">${warning.days} days left</span>` : admin.subscription_expiry}</td><td>${admin.is_active === false ? 'INACTIVE' : 'ACTIVE'}</td><td class="actions"><button class="btn" data-action="toggle" data-id="${admin.id}">${admin.is_active === false ? 'ACTIVATE' : 'DEACTIVATE'}</button><button class="btn" data-action="reset" data-id="${admin.id}">RESET PASSWORD</button><button class="btn danger" data-action="delete" data-id="${admin.id}">DELETE</button></td></tr>`;
  }).join('') || '<tr><td colspan="5">No admin accounts found.</td></tr>';
}

function saveAndRender() { render(service.getAccounts()); }

$('createAdminForm').addEventListener('submit', event => {
  event.preventDefault();
  const username = $('username').value.trim();
  const businessName = $('businessName').value.trim();
  if (!username || !businessName) return message('Username and business name are required.');
  const accounts = service.getAccounts();
  if (accounts.some(account => account.username.toLowerCase() === username.toLowerCase())) return message('Username already exists.');
  const start = new Date().toISOString().slice(0, 10);
  accounts.push({ id: `ADM-${Date.now()}`, username, password: `${username}@123`, role: 'admin', admin_id: accounts.filter(a => a.role === 'admin').length + 1, business_name: businessName, name: $('name').value.trim(), phone: $('phone').value.trim(), email: $('email').value.trim(), address: $('address').value.trim(), subscription_start: start, subscription_expiry: (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })(), is_active: true });
  service.saveAccounts(accounts);
  event.target.reset();
  message(`Admin created. Initial password: ${username}@123`, true);
  saveAndRender();
});

$('adminTable').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const accounts = service.getAccounts();
  const admin = accounts.find(account => String(account.id) === String(id));
  if (!admin) return;

  if (button.dataset.action === 'toggle') {
    admin.is_active = admin.is_active === false;
    service.saveAccounts(accounts);
    saveAndRender();
    return;
  }

  if (button.dataset.action === 'reset') {
    admin.password = `${admin.username}@123`;
    service.saveAccounts(accounts);
    message(`Password reset to ${admin.username}@123`, true);
    return;
  }

  if (button.dataset.action === 'delete' && confirmPermanentDelete(admin.business_name)) {
    service.saveAccounts(accounts.filter(account => account.id !== admin.id));
    message('Admin deleted permanently.', true);
    saveAndRender();
  }
});

$('refreshButton').addEventListener('click', saveAndRender);
saveAndRender();
