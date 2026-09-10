import SwiftUI
import UIKit

struct OrderView: View {
    let user: SessionUser
    let medical: SelectedMedical
    let initialItems: [CartItem]
    let onBack: () -> Void
    let onNewOrder: () -> Void
    @State private var order: [CartItem]
    @State private var showFinal = false

    init(user: SessionUser, medical: SelectedMedical, initialItems: [CartItem], onBack: @escaping () -> Void, onNewOrder: @escaping () -> Void) {
        self.user = user; self.medical = medical; self.initialItems = initialItems; self.onBack = onBack; self.onNewOrder = onNewOrder
        _order = State(initialValue: initialItems)
    }

    var body: some View {
        List {
            Section { Text("Medical: \(medical.name)") }
            if order.isEmpty { Text("Your order is empty.").foregroundStyle(.secondary) }
            ForEach($order) { $item in
                HStack {
                    Text(item.name).lineLimit(2)
                    Spacer()
                    Stepper("\(item.quantity) \(item.unit)", value: $item.quantity, in: 1...999)
                    Button("×", role: .destructive) { order.removeAll { $0.id == item.id } }
                }
            }
            Section { Button("FINAL ORDER") { showFinal = true }.disabled(order.isEmpty) }
        }
        .navigationTitle("Current Order")
        .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Add more products", action: onBack) } }
        .sheet(isPresented: $showFinal) { FinalOrderView(user: user, medical: medical, order: order, onNewOrder: onNewOrder) }
    }
}

private struct FinalOrderView: View {
    let user: SessionUser
    let medical: SelectedMedical
    let order: [CartItem]
    let onNewOrder: () -> Void
    private var message: String { "*#\(medical.name)*\n\n" + order.enumerated().map { "\($0.offset + 1). \($0.element.name) ----> \($0.element.quantity) \($0.element.unit)" }.joined(separator: "\n") }
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text("Final Order").font(.largeTitle.bold())
                ScrollView { Text(message).frame(maxWidth: .infinity, alignment: .leading) }
                ShareLink(item: message) { Label("SEND ORDER", systemImage: "square.and.arrow.up") }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
                Button("OPEN WHATSAPP") { if let url = URL(string: "https://wa.me/919028773301?text=\(message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") { UIApplication.shared.open(url) } }.frame(maxWidth: .infinity)
                Button("START NEW ORDER", role: .destructive, action: onNewOrder).frame(maxWidth: .infinity)
                Text("Logged in as: \(user.username)").font(.footnote).foregroundStyle(.secondary)
            }.padding().navigationTitle("Final Order")
        }
    }
}
