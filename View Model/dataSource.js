import { API_BASE_URL, USE_LOCAL_API } from '../API/apiConfig.js';

export class ProductDataSource {
  async getAll() { throw new Error('getAll() must be implemented'); }
  async search(query) { throw new Error('search() must be implemented'); }
}

export class JsonProductDataSource extends ProductDataSource {
  constructor(url = '../data/products.json') { super(); this.url = url; }
  async getAll() { const response = await fetch(this.url); if (!response.ok) throw new Error('Product JSON could not be loaded'); return response.json(); }
  async search(query = '') { const products = await this.getAll(); const q = query.trim().toLowerCase(); return products.filter(product => `${product.name || ''} ${product.company || ''} ${product.formula || ''}`.toLowerCase().includes(q)); }
}

export class ApiProductDataSource extends ProductDataSource {
  constructor(baseUrl = API_BASE_URL) { super(); this.baseUrl = baseUrl.replace(/\/$/, ''); }
  async getAll() { const response = await fetch(`${this.baseUrl}/products`); if (!response.ok) throw new Error('Product API could not be loaded'); return response.json(); }
  async search(query = '') { const response = await fetch(`${this.baseUrl}/products?search=${encodeURIComponent(query)}`); if (!response.ok) throw new Error('Product API search failed'); return response.json(); }
}

export class LocalFirstProductDataSource extends ApiProductDataSource {
  constructor(jsonUrl = '../data/products.json') { super(); this.jsonSource = new JsonProductDataSource(jsonUrl); }
  async getAll() { if (USE_LOCAL_API) { try { return await super.getAll(); } catch (_) {} } return this.jsonSource.getAll(); }
  async search(query = '') { if (USE_LOCAL_API) { try { return await super.search(query); } catch (_) {} } return this.jsonSource.search(query); }
}
