import { API_BASE_URL } from '../API/apiConfig.js';
import { ErrorModel } from '../Models/errorModel.js';

export class TempAuthDataSource {
  async login(username, password) {
    if (!username?.trim()) throw ErrorModel.usernameRequired();
    if (!password) throw ErrorModel.passwordRequired();

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password })
    });

    if (!response.ok) {
      let message = 'Invalid username or password.';
      try {
        const body = await response.json();
        message = body.detail || message;
      } catch (_) {}
      throw new Error(message);
    }

    return response.json();
  }
}
