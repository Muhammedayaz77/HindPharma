import SwiftUI

struct AdminDashboardView: View {
    let user: SessionUser
    @StateObject private var vm = AdminDashboardViewModel()
    var body: some View {
        List {
            if let error = vm.errorMessage { Text(error).foregroundStyle(.red) }
            Section("Business Control Center") {
                StatRow(title: "ACTIVE USERS", value: vm.userCount)
                StatRow(title: "MEDICALS", value: vm.medicalCount)
                StatRow(title: "PRODUCTS", value: vm.productCount)
            }
        }
        .overlay { if vm.isLoading { ProgressView() } }
        .navigationTitle("Admin Dashboard")
        .task { await vm.load(token: user.token) }
    }
}
