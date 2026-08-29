import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js';
import { TempDataService } from '../temp/temp_file_dataService.js';

const form = document.getElementById('form');
const error = document.getElementById('error');
const dataService = new TempDataService();
const authDataSource = new TempAuthDataSource(dataService);
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function saveLoginSession(user) {
  localStorage.setItem('hindPharmaUser', user.username);
  localStorage.setItem('hindPharmaRole', user.role);
  localStorage.setItem('hindPharmaToken', user.token);
  localStorage.setItem('hindPharmaLoginTime', String(Date.now()));
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  try {
    const user = await authDataSource.login(
      document.getElementById('username').value.trim(),
      document.getElementById('password').value
    );
    saveLoginSession(user);
    location.href = 'index.html';
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});

// Remove only an expired 12-hour session. Closing/reopening the browser does not log the user out.
const loginTime = Number(localStorage.getItem('hindPharmaLoginTime') || 0);
if (loginTime && Date.now() - loginTime >= SESSION_DURATION_MS) {
  localStorage.removeItem('hindPharmaUser');
  localStorage.removeItem('hindPharmaRole');
  localStorage.removeItem('hindPharmaToken');
  localStorage.removeItem('hindPharmaLoginTime');
}
