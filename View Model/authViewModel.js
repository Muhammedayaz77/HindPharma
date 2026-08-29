export class AuthViewModel {
  constructor(dataSource) { this.dataSource = dataSource; }

  async login(username, password) {
    const user = await this.dataSource.login(username.trim(), password);
    sessionStorage.setItem('hindPharmaUser', user.username);
    localStorage.setItem('hindPharmaLoginAt', String(Date.now()));
    return user;
  }
}
