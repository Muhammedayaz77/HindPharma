import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-1';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-1';

const session = TempSessionService.requireRole('admin');
if (!session) throw new Error('Admin login required.');
const dataService = new TempDataService();
document.getElementById('adminName').textContent = `Signed in as ${session.username}`;
document.getElementById('businessName').textContent = session.business_name || 'Manage your business records from one place.';
document.getElementById('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });

function renderSubscriptionWarning() {
  const warning = dataService.getSubscriptionWarning(session);
  const target = document.getElementById('subscriptionWarning');
  target.innerHTML = warning ? `<div class="card" style="margin-bottom:16px;font-size:13px;font-weight:700">⚠️ Subscription expires in ${warning.days} day${warning.days === 1 ? '' : 's'} (${warning.expiry}).</div>` : '';
}
async function setCount(id, loader) { try { document.getElementById(id).textContent = (await loader()).length; } catch (_) { document.getElementById(id).textContent = '—'; } }
async function loadStats() { await Promise.all([setCount('userCount', () => dataService.getUsers()), setCount('medicalCount', () => dataService.getMedicals()), setCount('productCount', () => dataService.getProducts())]); }
renderSubscriptionWarning();
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
loadStats();
