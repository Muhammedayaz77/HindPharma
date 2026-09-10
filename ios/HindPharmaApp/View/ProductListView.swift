import SwiftUI

struct ProductListView: View {
    let user: SessionUser
    @StateObject private var viewModel = ProductListViewModel()

    var body: some View {
        List {
            if let error = viewModel.errorMessage { Text(error).foregroundStyle(.red) }
            Text("\(viewModel.filtered.count) products found").foregroundStyle(.secondary)
            ForEach(viewModel.filtered) { product in
                VStack(alignment: .leading, spacing: 5) {
                    Text(product.name).font(.headline)
                    if let company = product.company { Text(company).foregroundStyle(.secondary) }
                    if let formula = product.formula { Text(formula).font(.footnote).foregroundStyle(.secondary) }
                    if let mrp = product.mrp { Text("MRP: ₹\(mrp, specifier: "%.2f")").font(.footnote) }
                }.padding(.vertical, 4)
            }
        }
        .overlay { if viewModel.isLoading { ProgressView() } }
        .searchable(text: $viewModel.search, prompt: "Product, company or formula")
        .navigationTitle("Select Products")
        .task { await viewModel.load(token: user.token) }
    }
}
