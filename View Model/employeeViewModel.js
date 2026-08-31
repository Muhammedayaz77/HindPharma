import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-1';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-1';

const session = TempSessionService.requireRole('employee');
if (!session) throw new Error('Employee login required.');
const service = new TempDataService();
const $ = id => document.getElementById(id);
$('employeeName').textContent = `Signed in as ${session.username}`;
$('businessName').textContent = session.business_name || 'Business workspace';
$('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });
const warning = service.getSubscriptionWarning(session);
if (warning) $('subscriptionWarning').innerHTML = `<div class="card warning" style="margin:16px 0">⚠️ Subscription expires in ${warning.days} day${warning.days === 1 ? '' : 's'} (${warning.expiry}).</div>`;
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
