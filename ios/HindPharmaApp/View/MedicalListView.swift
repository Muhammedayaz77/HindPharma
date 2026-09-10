import SwiftUI

struct MedicalListView: View {
    let user: SessionUser
    @StateObject private var viewModel = MedicalListViewModel()

    var body: some View {
        List {
            if let error = viewModel.errorMessage { Text(error).foregroundStyle(.red) }
            ForEach(viewModel.filtered) { medical in
                VStack(alignment: .leading, spacing: 5) {
                    Text(medical.name).font(.headline)
                    if let area = medical.area { Text(area).foregroundStyle(.secondary) }
                    if let phone = medical.phone, let url = URL(string: "tel://\(phone.filter { $0.isNumber })") { Link(phone, destination: url) }
                }.padding(.vertical, 4)
            }
        }
        .overlay { if viewModel.isLoading { ProgressView() } }
        .searchable(text: $viewModel.search, prompt: "Medical name or area")
        .navigationTitle("Select Medical")
        .task { await viewModel.load(token: user.token) }
    }
}
