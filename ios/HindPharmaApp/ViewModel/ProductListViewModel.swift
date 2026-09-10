import Foundation
import Combine

@MainActor final class ProductListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var search = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    func load(token: String?) async {
        guard !isLoading else { return }; isLoading = true; errorMessage = nil
        do { products = try await APIClient(token: token).products() } catch { errorMessage = error.localizedDescription }
        isLoading = false
    }
    var filtered: [Product] { let q=search.trimmingCharacters(in:.whitespacesAndNewlines).lowercased(); guard !q.isEmpty else{return products}; return products.filter{[$0.name,$0.company,$0.formula,$0.product_id,$0.code].compactMap{$0?.lowercased()}.joined(separator:" ").contains(q)} }
}
