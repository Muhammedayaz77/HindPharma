import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js?v=20260901-3';
import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-3';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-4';
import { ErrorModel } from '../Models/errorModel.js';

const form = document.getElementById('form');
const error = document.getElementById('error');
const dataService = new TempDataService();
const authDataSource = new TempAuthDataSource(dataService);

function showError(loginError) {
    error.textContent = loginError?.message || 'Unable to complete login. Please try again.';
}

if (TempSessionService.isLoggedIn()) location.replace('index.html');

form.addEventListener('submit', async event => {
    event.preventDefault();
    error.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        if (!username) throw ErrorModel.usernameRequired();
        if (!password) throw ErrorModel.passwordRequired();

        const user = await authDataSource.login(username, password);
        if (!user) throw ErrorModel.invalidCredentials();

        TempSessionService.save(user);
        location.replace('index.html');
    } catch (loginError) {
        showError(loginError);
    }
});
