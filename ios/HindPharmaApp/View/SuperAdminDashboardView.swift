import SwiftUI

struct SuperAdminDashboardView: View {
    let user: SessionUser
    @StateObject private var vm = SuperAdminDashboardViewModel()
    var body: some View {
        List {
            if let error = vm.errorMessage { Text(error).foregroundStyle(.red) }
            Section("HTG Businesses") {
                Text("Businesses: \(vm.admins.count)").font(.headline)
                ForEach(vm.admins) { admin in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(admin.business_name).font(.headline)
                        Text("Admin: \(admin.username)")
                        Text(admin.is_active == 1 ? "ACTIVE" : "INACTIVE")
                        if let expiry = admin.subscription_expiry {
                            Text("Expiry: \(expiry)").font(.footnote).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .overlay { if vm.isLoading { ProgressView() } }
        .navigationTitle("HTG Super Admin")
        .task { await vm.load(token: user.token) }
    }
}
