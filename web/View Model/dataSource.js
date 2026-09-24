import { API_BASE_URL } from '../API/apiConfig.js';
export class ProductDataSource { async getAll(){throw new Error('getAll() must be implemented')} async search(){throw new Error('search() must be implemented')} }
export class ApiProductDataSource extends ProductDataSource {
  constructor(baseUrl=API_BASE_URL){super();this.baseUrl=baseUrl.replace(/\/$/,'');this._cache=null}
  async getAll(){if(this._cache)return this._cache;const r=await fetch(`${this.baseUrl}/products`,{headers:this._headers(),cache:'no-store'});if(!r.ok)throw new Error('Product API could not be loaded');this._cache=await r.json();return this._cache}
  async search(query=''){const r=await fetch(`${this.baseUrl}/products?search=${encodeURIComponent(query)}`,{headers:this._headers(),cache:'no-store'});if(!r.ok)throw new Error('Product API search failed');return r.json()}
  _headers(){const token=localStorage.getItem('hindPharmaToken');return token?{Authorization:`Bearer ${token}`}:{}}
}
export class LocalFirstProductDataSource extends ApiProductDataSource {}
