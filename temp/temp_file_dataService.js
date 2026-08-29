const STORAGE_PREFIX = 'hindPharmaTemp_';

export class TempDataService {
  constructor(basePath = '../data/') { this.basePath = basePath; }

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

  async getUsers() {
    const seedUsers = await this.readJson('users.json');
    const overlayUsers = this.readOverlay('users');
    const mergedUsers = [...seedUsers];
    for (const overlayUser of overlayUsers) {
      const index = mergedUsers.findIndex(user => user.username.toLowerCase() === overlayUser.username.toLowerCase());
      if (index >= 0) mergedUsers[index] = overlayUser;
      else mergedUsers.push(overlayUser);
    }
    return mergedUsers;
  }

  async authenticateUser(username, password) {
    const users = await this.getUsers();
    const user = users.find(item => item.username.toLowerCase() === username.toLowerCase());
    if (!user || user.is_active === false) return null;
    const passwordHash = await this.sha256(password);
    if (user.password_hash !== passwordHash) return null;
    return { ...user, token: await this.createSessionToken(user) };
  }

  async getMedicals() { return [...await this.readJson('medicals.json'), ...this.readOverlay('medicals')]; }
  async getProducts() { return [...await this.readJson('products.json'), ...this.readOverlay('products')]; }

  async addMedical(medical) {
    const medicals = this.readOverlay('medicals'); medicals.push(medical); this.writeOverlay('medicals', medicals); return medical;
  }
  async addUser(user) {
    const users = this.readOverlay('users'); users.push(user); this.writeOverlay('users', users); return user;
  }
  async addProduct(product) {
    const products = this.readOverlay('products'); products.push(product); this.writeOverlay('products', products); return product;
  }

  async sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hashBuffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async createSessionToken(user) { return this.sha256(`${user.username}:${user.role}:${Date.now()}`); }
}
