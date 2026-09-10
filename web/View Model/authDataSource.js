export class AuthDataSource {
  async login(username, password) { throw new Error('login() must be implemented'); }
}

export class ApiAuthDataSource extends AuthDataSource {
  constructor(baseUrl) { super(); this.baseUrl = baseUrl.replace(/\/$/, ''); }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Invalid username or password.');
    return response.json();
  }
}
