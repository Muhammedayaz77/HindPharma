export class TempAuthDataSource {
  constructor(dataService) {
    this.dataService = dataService;
  }

  async login(username, password) {
    const user = await this.dataService.authenticateUser(username, password);
    if (!user) throw new Error('Invalid username or password.');
    return {
      id: user.id,
      username: user.username,
      role: user.role || 'user',
      token: user.token
    };
  }
}
