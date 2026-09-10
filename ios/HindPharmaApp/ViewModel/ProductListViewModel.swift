import Foundation

@MainActor
final class ProductListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var search = ""
    @Published var isLoading = false
    @Published var errorMessage: String?

    func load(token: String?) async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        do { products = try await ApiClient(token: token).getProducts() }
        catch { errorMessage = error.localizedDescription }
        isLoading = false
    }

    var filtered: [Product] {
        let query = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !query.isEmpty else { return products }
        return products.filter {
            [$0.name, $0.company, $0.formula, $0.productId, $0.code]
                .compactMap { $0?.lowercased() }
                .joined(separator: " ").contains(query)
        }
    }
}
