import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    var body: some View { Group { if let user = viewModel.sessionUser { ShopHomeView(user: user, viewModel: viewModel) } else { LoginView(viewModel: viewModel) } } }
}

private struct LoginView: View {
    @ObservedObject var viewModel: HomeViewModel
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("HIND PHARMA").font(.largeTitle.bold())
                Text("Login to start your shop work").foregroundStyle(.secondary)
                TextField("Username", text: $viewModel.username).textInputAutocapitalization(.never).autocorrectionDisabled().textFieldStyle(.roundedBorder)
                SecureField("Password", text: $viewModel.password).textFieldStyle(.roundedBorder)
                if let error = viewModel.errorMessage { Text(error).foregroundStyle(.red).font(.footnote).frame(maxWidth: .infinity, alignment: .leading) }
                Button { Task { await viewModel.login() } } label: { if viewModel.isLoading { ProgressView() } else { Text("LOGIN") } }.frame(maxWidth: .infinity).buttonStyle(.borderedProminent).disabled(viewModel.isLoading)
            }.padding(24).navigationTitle("Login")
        }
    }
}

private struct ShopHomeView: View {
    let user: SessionUser
    @ObservedObject var viewModel: HomeViewModel
    private let actions: [(String, Set<String>)] = [
        ("Daily Calling", ["admin", "manager", "employee"]), ("Medical List", ["admin", "manager", "employee"]),
        ("Products", ["admin", "manager", "employee"]), ("Order", ["admin", "manager", "employee"]),
        ("Manager Dashboard", ["admin", "manager"]), ("Admin Dashboard", ["admin"]), ("HTG Super Admin", ["super_admin"])
    ]
    var body: some View {
        NavigationStack {
            List {
                Section { Text(user.businessName ?? "Hind Pharma").font(.title2.bold()); Text("\(user.username) · \(user.roleDisplayName)").foregroundStyle(.secondary) }
                Section("Home") {
                    ForEach(actions.filter { $0.1.contains(user.role) }, id: \.0) { action in
                        if action.0 == "Daily Calling" { NavigationLink(action.0) { DailyCallingView(user: user) } }
                        else { NavigationLink(action.0) { ContentUnavailableView(action.0, systemImage: "square.grid.2x2", description: Text("Native feature route will be ported next.")) } }
                    }
                }
                Section { Button("Logout", role: .destructive, action: viewModel.logout) }
            }.navigationTitle("Hind Pharma")
        }
    }
}

#Preview { HomeView() }
