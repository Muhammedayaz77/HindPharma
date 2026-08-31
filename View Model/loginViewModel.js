import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js?v=20260901-1';
import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-1';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-1';

const form = document.getElementById('form');
const error = document.getElementById('error');
const dataService = new TempDataService();
const authDataSource = new TempAuthDataSource(dataService);

function destinationFor(role) {
  if (role === 'super_admin') return 'super-admin.html';
  if (role === 'admin') return 'admin.html';
  if (role === 'manager') return 'manager.html';
  return 'employee.html';
}

if (TempSessionService.isLoggedIn()) {
  const session = TempSessionService.get();
  location.replace(destinationFor(session.role));
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  try {
    const user = await authDataSource.login(
      document.getElementById('username').value.trim(),
      document.getElementById('password').value
    );
    if (!user) throw new Error('Invalid username or password.');
    TempSessionService.save(user);
    location.replace(destinationFor(user.role));
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});
