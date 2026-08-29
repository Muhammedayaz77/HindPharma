import { ApiAuthDataSource } from './authDataSource.js';
import { AuthViewModel } from './authViewModel.js';

const form = document.getElementById('form');
const error = document.getElementById('error');
const apiBaseUrl = window.HIND_PHARMA_API_URL || '';

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  if (!apiBaseUrl) {
    error.textContent = 'Login service is not configured yet.';
    return;
  }
  try {
    const viewModel = new AuthViewModel(new ApiAuthDataSource(apiBaseUrl));
    const user = await viewModel.login(document.getElementById('username').value, document.getElementById('password').value);
    location.href = user.role === 'admin' ? 'admin.html' : 'medical.html';
  } catch (loginError) {
    error.textContent = loginError.message;
  }
});
