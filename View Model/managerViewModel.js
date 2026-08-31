import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-1';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-1';

const session = TempSessionService.requireRole('manager');
if (!session) throw new Error('Manager login required.');
const service = new TempDataService();
const $ = id => document.getElementById(id);
$('managerName').textContent = `Signed in as ${session.username}`;
$('businessName').textContent = session.business_name || 'Business workspace';
$('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });

function renderWarning() {
  const warning = service.getSubscriptionWarning(session);
  $('subscriptionWarning').innerHTML = warning ? `<div class="card warning" style="margin:16px 0">⚠️ Subscription expires in ${warning.days} day${warning.days === 1 ? '' : 's'} (${warning.expiry}).</div>` : '';
}
async function load() {
  const [users, medicals, products] = await Promise.all([service.getAllTenantUsers(session.admin_id || 1), service.getMedicals(), service.getProducts()]);
  $('employeeCount').textContent = users.filter(user => user.role === 'employee').length;
  $('medicalCount').textContent = medicals.length;
  $('productCount').textContent = products.length;
}
renderWarning();
load();
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
