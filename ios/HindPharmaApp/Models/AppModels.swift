import Foundation

struct SessionUser: Identifiable {
    let id: String
    let username: String
    let role: String
    let adminID: String?
    let businessName: String?
    let subscriptionExpiry: String?
    let token: String

    var roleDisplayName: String {
        switch role {
        case "super_admin": return "HTG Super Admin"
        case "admin": return "Admin"
        case "manager": return "Manager"
        default: return "Employee"
        }
    }
}
