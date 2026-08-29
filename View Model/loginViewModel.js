import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js';
import { TempDataService } from '../temp/temp_file_dataService.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js';

const form = document.getElementById('form');
const error = document.getElementById('error');
const dataService = new TempDataService();
const authDataSource = new TempAuthDataSource(dataService);

// A valid existing session should never ask the user to log in again.
if (TempSessionService.isLoggedIn()) {
  location.replace('index.html');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  try {
    const user = await authDataSource.login(
      document.getElementById('username').value.trim(),
      document.getElementById('password').value
    );
    TempSessionService.save(user);
    location.replace('index.html');
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});
