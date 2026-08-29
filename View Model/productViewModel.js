export class ProductViewModel {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.products = [];
    this.filteredProducts = [];
  }

  async loadProducts() {
    this.products = await this.dataSource.getAll();
    this.filteredProducts = this.products;
    return this.filteredProducts;
  }

  async searchProducts(query) {
    this.filteredProducts = await this.dataSource.search(query);
    return this.filteredProducts;
  }
}
