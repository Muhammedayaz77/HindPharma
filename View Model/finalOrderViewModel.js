const SESSION_HOURS = 12;

function validSession() {
  const user = sessionStorage.getItem('hindPharmaUser');
  const loginAt = Number(localStorage.getItem('hindPharmaLoginAt') || 0);
  if (!user || !loginAt || Date.now() - loginAt >= SESSION_HOURS * 60 * 60 * 1000) {
    sessionStorage.removeItem('hindPharmaUser');
    localStorage.removeItem('hindPharmaLoginAt');
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.removeItem('hindPharmaUser');
  localStorage.removeItem('hindPharmaLoginAt');
  localStorage.removeItem('hindPharmaOrder');
  localStorage.removeItem('hindPharmaMedical');
  location.href = 'index.html';
}

if (!validSession()) location.replace('login.html');

document.getElementById('user').textContent = sessionStorage.getItem('hindPharmaUser') || '';

const order = JSON.parse(localStorage.getItem('hindPharmaOrder') || '[]');
const medical = localStorage.getItem('hindPharmaMedical') || 'MEDICAL NAME';
const text = `*#${medical}*\n\n` + order.map((item, index) => `${index + 1}. ${item.name} ----> ${item.quantity}`).join('\n');

document.getElementById('preview').textContent = text;
document.getElementById('logout').onclick = logout;
document.getElementById('whatsapp').onclick = () => {
  window.location.href = 'https://wa.me/919028773301?text=' + encodeURIComponent(text);
};
document.getElementById('new').onclick = () => {
  localStorage.removeItem('hindPharmaOrder');
  localStorage.removeItem('hindPharmaMedical');
  location.href = 'medical.html';
};

setInterval(() => { if (!validSession()) location.replace('login.html'); }, 60000);
