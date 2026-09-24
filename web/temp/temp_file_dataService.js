import { API_BASE_URL } from '../API/apiConfig.js';
import { TempSessionService } from './temp_file_sessionService.js';

async function request(path, options={}) {
  const headers = new Headers(options.headers || {});
  const session = TempSessionService.get();
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
  const response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try { const body=await response.json(); message=body.detail || message; } catch (_) {}
    throw new Error(message);
  }
  if (response.status===204) return null;
  return response.json();
}

export class TempDataService {
  getSubscriptionWarning(user){ if(!user||user.role==='super_admin'||!user.subscription_expiry)return null; const days=Math.ceil((new Date(user.subscription_expiry+'T23:59:59')-new Date())/86400000); return days>=0&&days<=30?{days,expiry:user.subscription_expiry}:null; }\n  async getUsers(){ return request('/users'); }\n  async getAllTenantUsers(){ return request('/users'); }
  async addUser(user){ return request('/users',{method:'POST',body:JSON.stringify({username:user.username,role:user.role,name:user.name||null,phone:user.phone||null})}); }
  async deleteUser(user){ return request(`/users/${encodeURIComponent(user.id)}`,{method:'DELETE'}); }
  async resetUserPassword(user){ return request(`/users/${encodeURIComponent(user.id)}/reset-password`,{method:'POST'}); }

  async getMedicals(search=''){ return request(`/medicals?search=${encodeURIComponent(search)}`); }
  async addMedical(medical){ return request('/medicals',{method:'POST',body:JSON.stringify({name:medical.name,area:medical.area||null,phone:medical.phone||null})}); }
  async updateMedical(medical){ return request(`/medicals/${encodeURIComponent(medical.id)}`,{method:'PUT',body:JSON.stringify({name:medical.name,area:medical.area||null,phone:medical.phone||null})}); }
  async deleteMedical(medical){ return request(`/medicals/${encodeURIComponent(medical.id)}`,{method:'DELETE'}); }

  async getProducts(search=''){ return request(`/products?search=${encodeURIComponent(search)}`); }
  async addProduct(product){ return request('/products',{method:'POST',body:JSON.stringify({product_id:product.product_id||product.id||null,code:product.code||null,name:product.name,unit:product.unit||null,mrp:Number(product.mrp||0),formula:product.formula||null,company:product.company||null,image:product.image||null})}); }
  async addProducts(products){ return request('/products/bulk',{method:'POST',body:JSON.stringify(products.map(p=>({product_id:p.product_id||p.id||null,code:p.code||null,name:p.name,unit:p.unit||null,mrp:Number(p.mrp||0),formula:p.formula||null,company:p.company||null,image:p.image||null}))) }); }
  async updateProduct(product){ return request(`/products/${encodeURIComponent(product.id)}`,{method:'PUT',body:JSON.stringify({product_id:product.product_id||product.id||null,code:product.code||null,name:product.name,unit:product.unit||null,mrp:Number(product.mrp||0),formula:product.formula||null,company:product.company||null,image:product.image||null})}); }
  async deleteProduct(product){ return request(`/products/${encodeURIComponent(product.id)}`,{method:'DELETE'}); }

  async getCallingToday(){ return request('/calling/today',{cache:'no-store'}); }
  async recordCall(medicalId){ return request(`/calling/${encodeURIComponent(medicalId)}/call`,{method:'POST'}); }
  async updateCallStatus(medicalId,isPick){ return request(`/calling/${encodeURIComponent(medicalId)}/status`,{method:'PATCH',body:JSON.stringify({is_pick:isPick})}); }

  async createOrder(order){ return request('/orders',{method:'POST',body:JSON.stringify(order)}); }
  async getOrders(){ return request('/orders',{cache:'no-store'}); }

  async getAccounts(){ return []; }
  async authenticateUser(username,password){ return new (class extends Object {})(); }
  async sha256(value){ return value; }
}
