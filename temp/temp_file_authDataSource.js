import { ErrorModel } from '../Models/errorModel.js';

export class TempAuthDataSource {
  constructor(dataService) {
    this.dataService = dataService;
  }

  async login(username, password) {
    if (!username?.trim()) throw ErrorModel.usernameRequired();
    if (!password) throw ErrorModel.passwordRequired();

    const user = await this.dataService.authenticateUser(username, password);
    if (!user) throw ErrorModel.invalidCredentials();

    return {
      id: user.id,
      username: user.username,
      role: user.role || 'employee',
      admin_id: user.admin_id ?? null,
      business_name: user.business_name ?? null,
      subscription_start: user.subscription_start ?? null,
      subscription_expiry: user.subscription_expiry ?? null,
      token: user.token
    };
  }
}
