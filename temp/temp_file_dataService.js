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

  getDeleted(key) { return this.readOverlay(`deleted_${key}`); }
  addDeleted(key, identity) { const deleted = this.getDeleted(key); if (!deleted.includes(identity)) { deleted.push(identity); this.writeOverlay(`deleted_${key}`, deleted); } }
  identityForMedical(item) { return `${String(item.name || '').trim().toLowerCase()}|${String(item.area || '').trim().toLowerCase()}`; }
  identityForProduct(item) { return String(item.id || item.code || item.name || '').trim().toLowerCase(); }
  identityForUser(item) { return String(item.username || '').trim().toLowerCase(); }

  async getUsers() {
    const seedUsers = await this.readJson('users.json');
    const overlayUsers = this.readOverlay('users');
    const deleted = this.getDeleted('users');
    const mergedUsers = [...seedUsers];
    for (const overlayUser of overlayUsers) {
      const index = mergedUsers.findIndex(user => user.username.toLowerCase() === overlayUser.username.toLowerCase());
      if (index >= 0) mergedUsers[index] = overlayUser;
      else mergedUsers.push(overlayUser);
    }
    return mergedUsers.filter(user => !deleted.includes(this.identityForUser(user)));
  }

  async authenticateUser(username, password) {
    const users = await this.getUsers();
    const user = users.find(item => item.username.toLowerCase() === username.toLowerCase());
    if (!user || user.is_active === false) return null;
    const passwordHash = await this.sha256(password);
    if (user.password_hash !== passwordHash) return null;
    return { ...user, token: await this.createSessionToken(user) };
  }

  async getMedicals() {
    const items = [...await this.readJson('medicals.json'), ...this.readOverlay('medicals')];
    const deleted = this.getDeleted('medicals');
    return items.filter(item => !deleted.includes(this.identityForMedical(item)));
  }

  async getProducts() {
    const items = [...await this.readJson('products.json'), ...this.readOverlay('products')];
    const deleted = this.getDeleted('products');
    return items.filter(item => !deleted.includes(this.identityForProduct(item)));
  }

  async addMedical(medical) { const medicals = this.readOverlay('medicals'); medicals.push(medical); this.writeOverlay('medicals', medicals); return medical; }
  async addUser(user) { const users = this.readOverlay('users'); users.push(user); this.writeOverlay('users', users); return user; }
  async addProduct(product) { const products = this.readOverlay('products'); products.push(product); this.writeOverlay('products', products); return product; }

  async deleteMedical(medical) { this.addDeleted('medicals', this.identityForMedical(medical)); return true; }
  async deleteProduct(product) { this.addDeleted('products', this.identityForProduct(product)); return true; }
  async deleteUser(user) { this.addDeleted('users', this.identityForUser(user)); return true; }

  async sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hashBuffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async createSessionToken(user) { return this.sha256(`${user.username}:${user.role}:${Date.now()}`); }
}
