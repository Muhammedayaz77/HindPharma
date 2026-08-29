import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js';
import { TempDataService } from '../temp/temp_file_dataService.js';

const form = document.getElementById('form');
const error = document.getElementById('error');
const dataService = new TempDataService();
const authDataSource = new TempAuthDataSource(dataService);

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  try {
    const user = await authDataSource.login(
      document.getElementById('username').value.trim(),
      document.getElementById('password').value
    );
    sessionStorage.setItem('hindPharmaUser', user.username);
    sessionStorage.setItem('hindPharmaRole', user.role);
    sessionStorage.setItem('hindPharmaToken', user.token);
    location.href = user.role === 'admin' ? 'admin.html' : 'medical.html';
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});
