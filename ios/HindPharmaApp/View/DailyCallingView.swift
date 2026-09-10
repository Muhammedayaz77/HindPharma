import SwiftUI

struct DailyCallingView: View {
    let user: SessionUser
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = DailyCallingViewModel()

    var body: some View {
        List {
            if let error = viewModel.errorMessage { Text(error).foregroundStyle(.red) }
            ForEach(viewModel.items) { medical in
                VStack(alignment: .leading, spacing: 8) {
                    Text(medical.name).font(.headline)
                    if let area = medical.area { Text(area).foregroundStyle(.secondary) }
                    Text("Status: \(medical.isCalled ? "Called" : "Not Called") · \(status(medical))")
                        .font(.subheadline)
                    if let phone = medical.phone, let url = URL(string: "tel://\(phone.filter(\{ $0.isNumber || $0 == "+" \}))") {
                        Button(phone) {
                            Task {
                                await viewModel.call(medical.id, token: user.token)
                                await MainActor.run { UIApplication.shared.open(url) }
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    } else { Text("No mobile number").foregroundStyle(.secondary) }
                    if medical.isCalled {
                        HStack {
                            Button("Picked") { Task { await viewModel.setStatus(medical.id, picked: true, token: user.token) } }
                            Button("Not Picked") { Task { await viewModel.setStatus(medical.id, picked: false, token: user.token) } }
                        }
                    }
                }
                .padding(.vertical, 6)
            }
        }
        .navigationTitle("Daily Calling")
        .overlay { if viewModel.loading { ProgressView() } }
        .task { await viewModel.load(token: user.token) }
    }

    private func status(_ medical: CallingMedical) -> String {
        if medical.is_pick == 1 { return "Picked" }
        if medical.is_not_pick == 1 { return "Not Picked" }
        return "Pending"
    }
}
