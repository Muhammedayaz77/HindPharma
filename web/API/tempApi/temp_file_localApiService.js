import { API_BASE_URL } from '../apiConfig.js';

export class TempLocalApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      cache: 'no-store',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || data.message || 'Local API request failed.');
    return data;
  }

  getMedicals(search = '') { return this.request(`/medicals${search ? `?search=${encodeURIComponent(search)}` : ''}`); }
  getProducts(search = '') { return this.request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`); }
  getUsers() { return this.request('/users'); }
  addMedical(data) { return this.request('/admin/medicals', { method: 'POST', body: JSON.stringify(data) }); }
  addUser(data) { return this.request('/admin/users', { method: 'POST', body: JSON.stringify(data) }); }
  addProduct(data) { return this.request('/admin/products', { method: 'POST', body: JSON.stringify(data) }); }
  addProducts(data) { return this.request('/admin/products/bulk', { method: 'POST', body: JSON.stringify(data) }); }
  deleteMedical(id) { return this.request(`/admin/medicals/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
  deleteProduct(id) { return this.request(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
  deleteUser(id) { return this.request(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
  createOrder(data) { return this.request('/orders', { method: 'POST', body: JSON.stringify(data) }); }
}
