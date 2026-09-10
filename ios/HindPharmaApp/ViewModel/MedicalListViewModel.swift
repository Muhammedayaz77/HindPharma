import Foundation

@MainActor
final class MedicalListViewModel: ObservableObject {
    @Published var medicals: [Medical] = []
    @Published var search = ""
    @Published var isLoading = false
    @Published var errorMessage: String?

    func load(token: String?) async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        do { medicals = try await ApiClient(token: token).getMedicals() }
        catch { errorMessage = error.localizedDescription }
        isLoading = false
    }

    var filtered: [Medical] {
        let query = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !query.isEmpty else { return medicals }
        return medicals.filter { "\($0.name) \($0.area ?? "")".lowercased().contains(query) }
    }
}
