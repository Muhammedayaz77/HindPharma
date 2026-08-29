import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js?v=20260830-5';
import { TempDataService } from '../temp/temp_file_dataService.js?v=20260830-5';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260830-5';

const form = document.getElementById('form');
const error = document.getElementById('error');
const dataService = new TempDataService();
const authDataSource = new TempAuthDataSource(dataService);

if (TempSessionService.isLoggedIn()) location.replace('index.html?v=20260830-5');

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  try {
    const user = await authDataSource.login(
      document.getElementById('username').value.trim(),
      document.getElementById('password').value
    );
    TempSessionService.save(user);
    location.replace('index.html?v=20260830-5');
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});
