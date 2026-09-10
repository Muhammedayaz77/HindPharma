// Shared contract used by ViewModels.
// Current implementation is local. A future real HTTP API can implement the same methods.
export class TempApiContract {
  async getMedicals() { throw new Error('Not implemented'); }
  async getProducts(searchText = '') { throw new Error('Not implemented'); }
  async getUsers() { throw new Error('Not implemented'); }
  async addMedical(medical) { throw new Error('Not implemented'); }
  async addProduct(product) { throw new Error('Not implemented'); }
  async addProducts(products) { throw new Error('Not implemented'); }
  async addUser(user) { throw new Error('Not implemented'); }
  async deleteMedical(id) { throw new Error('Not implemented'); }
  async deleteProduct(id) { throw new Error('Not implemented'); }
  async deleteUser(id) { throw new Error('Not implemented'); }
  async createOrder(order) { throw new Error('Not implemented'); }
}
