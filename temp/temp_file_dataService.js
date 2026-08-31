const STORAGE_PREFIX = 'hindPharmaTemp_';
const DAY_MS = 24 * 60 * 60 * 1000;

function nextYearISO(start = new Date()) {
  const value = new Date(start);
  value.setFullYear(value.getFullYear() + 1);
  return value.toISOString().slice(0, 10);
}

export class TempDataService {
  constructor(basePath = '../data/') {
    this.basePath = basePath;
  }

  async readJson(fileName) {
    const response = await fetch(`${this.basePath}${fileName}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${fileName}.`);
    return response.json();
  }

  readOverlay(key) {
    try { return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${key}`) || '[]'); }
    catch (_) { return []; }
  }

  writeOverlay(key, value) { localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value)); }

  static defaultAccounts() {
    const start = new Date().toISOString().slice(0, 10);
    const expiry = nextYearISO();
    return [
      { id: 'SA001', username: 'Muhammed', password: 'Muhammed@123', role: 'super_admin', name: 'Muhammed', is_active: true },
      { id: 'ADM001', username: 'Ayaz', password: 'Ayaz@123', role: 'admin', admin_id: 1, business_name: 'Hind Pharma', subscription_start: start, subscription_expiry: expiry, is_active: true },
      { id: 'ADM002', username: 'riyaz', password: 'riyaz@123', role: 'admin', admin_id: 2, business_name: 'India Medical Agency', subscription_start: start, subscription_expiry: expiry, is_active: true }
    ];
  }

  getAccounts() {
    const saved = this.readOverlay('accounts');
    if (saved.length) return saved;
    const accounts = TempDataService.defaultAccounts();
    this.writeOverlay('accounts', accounts);
    return accounts;
  }

  saveAccounts(accounts) { this.writeOverlay('accounts', accounts); }

  async getUsers() {
    const seedUsers = await this.readJson('users.json');
    const overlayUsers = this.readOverlay('users');
    const deleted = this.readOverlay('deleted_users');
    const mergedUsers = [...seedUsers];
    for (const overlayUser of overlayUsers) {
      const index = mergedUsers.findIndex(user => user.username.toLowerCase() === overlayUser.username.toLowerCase());
      if (index >= 0) mergedUsers[index] = overlayUser;
      else mergedUsers.push(overlayUser);
    }
    return mergedUsers.filter(user => !deleted.includes(this.identityForUser(user)));
  }

  async getAllTenantUsers(adminId) {
    return (await this.getUsers()).filter(user => Number(user.admin_id || 1) === Number(adminId));
  }

  async authenticateUser(username, password) {
    const accounts = this.getAccounts();
    const account = accounts.find(item => item.username.toLowerCase() === username.trim().toLowerCase());
    if (account && account.is_active !== false && account.password === password) return this._sessionUser(account);

    const users = await this.getUsers();
    const user = users.find(item => item.username.toLowerCase() === username.trim().toLowerCase());
    if (!user || user.is_active === false || user.admin_id !== 1) return null;
    const expected = `${user.username}@123`;
    if (password !== expected) return null;
    return this._sessionUser({ ...user, password: expected, role: user.role || 'employee', admin_id: user.admin_id || 1, business_name: 'Hind Pharma' });
  }

  _sessionUser(user) {
    if (user.role !== 'super_admin' && user.subscription_expiry && new Date(`${user.subscription_expiry}T23:59:59`) < new Date()) return null;
    return { ...user, token: this.createSessionToken(user) };
  }

  getSubscriptionWarning(user) {
    if (!user || user.role === 'super_admin' || !user.subscription_expiry) return null;
    const days = Math.ceil((new Date(`${user.subscription_expiry}T23:59:59`) - new Date()) / DAY_MS);
    if (days >= 0 && days <= 30) return { days, expiry: user.subscription_expiry };
    return null;
  }

  async getMedicals() {
    const items = [...await this.readJson('medicals.json'), ...this.readOverlay('medicals')];
    const deleted = this.readOverlay('deleted_medicals');
    return items.filter(item => !deleted.includes(this.identityForMedical(item)));
  }

  async getProducts() {
    const items = [...await this.readJson('products.json'), ...this.readOverlay('products')];
    const deleted = this.readOverlay('deleted_products');
    return items.filter(item => !deleted.includes(this.identityForProduct(item)));
  }

  async addMedical(medical) { const medicals = this.readOverlay('medicals'); medicals.push(medical); this.writeOverlay('medicals', medicals); return medical; }
  async addUser(user) { const users = this.readOverlay('users'); users.push({ ...user, role: user.role || 'employee', admin_id: user.admin_id || 1 }); this.writeOverlay('users', users); return user; }
  async addProduct(product) { const products = this.readOverlay('products'); products.push(product); this.writeOverlay('products', products); return product; }

  async deleteMedical(medical) { this.addDeleted('medicals', this.identityForMedical(medical)); return true; }
  async deleteProduct(product) { this.addDeleted('products', this.identityForProduct(product)); return true; }
  async deleteUser(user) { this.addDeleted('users', this.identityForUser(user)); return true; }

  addDeleted(key, identity) { const deleted = this.readOverlay(`deleted_${key}`); if (!deleted.includes(identity)) { deleted.push(identity); this.writeOverlay(`deleted_${key}`, deleted); } }
  identityForMedical(item) { return `${String(item.name || '').trim().toLowerCase()}|${String(item.area || '').trim().toLowerCase()}`; }
  identityForProduct(item) { return String(item.id || item.code || item.name || '').trim().toLowerCase(); }
  identityForUser(item) { return String(item.username || '').trim().toLowerCase(); }

  async sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hashBuffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  createSessionToken(user) { return `temp-${user.username}-${user.role}-${Date.now()}`; }
}
