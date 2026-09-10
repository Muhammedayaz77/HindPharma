import { ErrorModel } from '../Models/errorModel.js';

export class TempAuthDataSource {
  constructor(dataService) {
    this.dataService = dataService;
  }

  async login(username, password) {
    if (!username?.trim()) throw ErrorModel.usernameRequired();
    if (!password) throw ErrorModel.passwordRequired();

    const normalizedUsername = username.trim().toLowerCase();
    const accounts = this.dataService.getAccounts();
    const account = accounts.find(item => item.username?.toLowerCase() === normalizedUsername);

    if (account) {
      if (account.is_active === false) throw ErrorModel.accountInactive();
      if (account.password !== password) throw ErrorModel.passwordWrong();
      if (account.role !== 'super_admin' && this.isExpired(account.subscription_expiry)) {
        throw ErrorModel.subscriptionExpired();
      }
    } else {
      const users = await this.dataService.getUsers();
      const user = users.find(item => item.username?.toLowerCase() === normalizedUsername);

      if (!user || Number(user.admin_id || 1) !== 1) throw ErrorModel.usernameWrong();
      if (user.is_active === false) throw ErrorModel.accountInactive();
      if (password !== `${user.username}@123`) throw ErrorModel.passwordWrong();

      const admin = accounts.find(item => Number(item.admin_id) === Number(user.admin_id || 1));
      if (admin?.is_active === false) throw ErrorModel.accountInactive();
      if (this.isExpired(admin?.subscription_expiry)) throw ErrorModel.subscriptionExpired();
    }

    const user = await this.dataService.authenticateUser(username, password);
    if (!user) throw ErrorModel.passwordWrong();

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

  isExpired(expiry) {
    if (!expiry) return false;
    return new Date(`${expiry}T23:59:59`) < new Date();
  }
}
