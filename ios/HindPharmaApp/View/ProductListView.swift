import SwiftUI

private let orderUnits = ["PIECE", "BOX", "CASE", "STRIP", "PACK", "BOTTLE", "TUBE", "VIAL", "OTHER"]

struct ProductListView: View {
    let user: SessionUser
    let medical: SelectedMedical
    let onOrder: ([CartItem]) -> Void
    @StateObject private var viewModel = ProductListViewModel()
    @State private var cart: [CartItem] = []
    @State private var selected: Product?
    @State private var quantity = 1
    @State private var unit = "PIECE"

    var body: some View {
        List {
            Section { Text("Medical: \(medical.name)") }
            if let error = viewModel.errorMessage { Text(error).foregroundStyle(.red) }
            Text("\(viewModel.filtered.count) products found").foregroundStyle(.secondary)
            ForEach(viewModel.filtered) { product in
                Button { selected = product; quantity = 1; unit = product.unit?.uppercased() ?? "PIECE"; if !orderUnits.contains(unit) { unit = "PIECE" } } label: {
                    VStack(alignment: .leading, spacing: 5) {
                        Text(product.name).font(.headline).foregroundStyle(.primary)
                        if let company = product.company { Text(company).foregroundStyle(.secondary) }
                        if let formula = product.formula { Text(formula).font(.footnote).foregroundStyle(.secondary) }
                        if let mrp = product.mrp { Text("MRP: ₹\(mrp, specifier: "%.2f")").font(.footnote).foregroundStyle(.secondary) }
                        Text("Tap to add").font(.caption).foregroundStyle(.secondary)
                    }.padding(.vertical, 4)
                }
            }
        }
        .overlay { if viewModel.isLoading { ProgressView() } }
        .searchable(text: $viewModel.search, prompt: "Product, company or formula")
        .navigationTitle("Order (\(cart.count))")
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Order") { onOrder(cart) }.disabled(cart.isEmpty) } }
        .task { await viewModel.load(token: user.token) }
        .sheet(item: $selected) { product in
            NavigationStack {
                Form {
                    Section("Quantity") { Stepper("\(quantity)", value: $quantity, in: 1...999) }
                    Section("Unit") { Picker("Unit", selection: $unit) { ForEach(orderUnits, id: \.self) { Text($0).tag($0) } } }
                }
                .navigationTitle(product.name)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { selected = nil } }; ToolbarItem(placement: .confirmationAction) { Button("Add to Order") { cart.append(CartItem(productID: product.id, name: product.name, quantity: quantity, unit: unit)); selected = nil } } }
            }
            .presentationDetents([.medium])
        }
    }
}
