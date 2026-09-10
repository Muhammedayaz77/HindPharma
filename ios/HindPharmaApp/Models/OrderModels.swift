import Foundation

struct SelectedMedical: Hashable { let id: Int; let name: String }
struct CartItem: Identifiable, Hashable { let id = UUID(); let productID: Int?; let name: String; var quantity: Int; let unit: String; let temporary: Bool = false }
