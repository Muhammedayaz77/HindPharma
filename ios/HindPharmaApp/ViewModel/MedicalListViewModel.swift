import Foundation
import Combine

@MainActor final class MedicalListViewModel: ObservableObject {
    @Published var medicals: [Medical] = []
    @Published var search = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    func load(token: String?) async {
        guard !isLoading else { return }; isLoading = true; errorMessage = nil
        do { medicals = try await APIClient(token: token).medicals() } catch { errorMessage = error.localizedDescription }
        isLoading = false
    }
    var filtered: [Medical] { let q=search.trimmingCharacters(in:.whitespacesAndNewlines).lowercased(); guard !q.isEmpty else{return medicals}; return medicals.filter{"\($0.name) \($0.area ?? \"\")".lowercased().contains(q)} }
}
