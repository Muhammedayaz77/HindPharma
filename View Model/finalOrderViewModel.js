import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-4';

const session = TempSessionService.requireLogin();
if (!session) throw new Error('Login required.');
document.getElementById('user').textContent = session.username;
document.getElementById('logout').onclick = () => { TempSessionService.clear(); location.href='index.html'; };
const order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]');
if (!order.length) location.replace('products.html');
const medical = localStorage.getItem('hindPharmaMedical') || 'MEDICAL NAME';
const text = `*#${medical}*\n\n` + order.map((item,index)=>`${index+1}. ${item.name} ----> ${item.quantity}`).join('\n');
document.getElementById('preview').textContent = text;
document.getElementById('whatsapp').onclick = () => { window.location.href='https://wa.me/919028773301?text='+encodeURIComponent(text); };
document.getElementById('new').onclick = () => { localStorage.removeItem('hindPharmaOrder'); localStorage.removeItem('hindPharmaMedical'); location.href='medical.html'; };
TempSessionService.startExpiryWatcher(()=>location.replace('login.html'));
