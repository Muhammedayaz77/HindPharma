export class ProductDataSource {
  async getAll() { throw new Error('getAll() must be implemented'); }
  async search(query) { throw new Error('search() must be implemented'); }
}

export class JsonProductDataSource extends ProductDataSource {
  constructor(url = '../data/products.json') {
    super();
    this.url = url;
    this._cache = null;
    this._searchIndex = null;
  }

  async getAll() {
    if (this._cache) return this._cache;
    const response = await fetch(this.url, { cache: 'default' });
    if (!response.ok) throw new Error('Product JSON could not be loaded');
    this._cache = await response.json();
    this._searchIndex = this._cache.map(product =>
      \`\${product.name || ''} \${product.company || ''} \${product.formula || ''} \${product.code || ''}\`.toLowerCase()
    );
    return this._cache;
  }

  async search(query = '') {
    const products = await this.getAll();
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((_, index) => this._searchIndex[index].includes(q));
  }
}

export class ApiProductDataSource extends ProductDataSource {
  constructor(baseUrl = API_BASE_URL) {
    super();
    this.baseUrl = baseUrl.replace(/\\/$/, '');
    this._cache = null;
  }

  async getAll() {
    if (this._cache) return this._cache;
    const response = await fetch(\`\${this.baseUrl}/products\`, { cache: 'default' });
    if (!response.ok) throw new Error('Product API could not be loaded');
    this._cache = await response.json();
    return this._cache;
  }

  async search(query = '') {
    if (!query.trim()) return this.getAll();
    const response = await fetch(\`\${this.baseUrl}/products?search=\${encodeURIComponent(query)}\`, { cache: 'default' });
    if (!response.ok) throw new Error('Product API search failed');
    return response.json();
  }
}

export class LocalFirstProductDataSource extends ApiProductDataSource {
  constructor(jsonUrl = '../data/products.json') {
    super();
    this.jsonSource = new JsonProductDataSource(jsonUrl);
  }

  async getAll() {
    return USE_LOCAL_API ? super.getAll() : this.jsonSource.getAll();
  }

  async search(query = '') {
    return USE_LOCAL_API ? super.search(query) : this.jsonSource.search(query);
  }
}
