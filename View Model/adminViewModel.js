import { TempDataService } from '../temp/temp_file_dataService.js?v=20260830-6';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-6';

const session = TempSessionService.requireAdmin();
if (!session) throw new Error('Admin login required.');
const dataService = new TempDataService();
document.getElementById('adminName').textContent = `Signed in as ${session.username}`;
document.getElementById('logoutButton').addEventListener('click', () => { TempSessionService.clear(); location.replace('login.html'); });

async function setCount(id, loader) { try { document.getElementById(id).textContent = (await loader()).length; } catch (_) { document.getElementById(id).textContent = '—'; } }
async function loadStats() { await Promise.all([setCount('userCount', () => dataService.getUsers()), setCount('medicalCount', () => dataService.getMedicals()), setCount('productCount', () => dataService.getProducts())]); }
TempSessionService.startExpiryWatcher(() => location.replace('login.html'));
loadStats();
