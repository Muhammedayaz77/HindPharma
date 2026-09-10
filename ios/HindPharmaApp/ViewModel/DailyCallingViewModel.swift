import Combine
import Foundation

@MainActor
final class DailyCallingViewModel: ObservableObject {
    @Published private(set) var items: [CallingMedical] = []
    @Published private(set) var loading = false
    @Published private(set) var calling = false
    @Published var errorMessage: String?

    func load(token: String) async {
        loading = true; errorMessage = nil
        do { items = try await APIClient(token: token).dailyCalling() }
        catch { errorMessage = error.localizedDescription }
        loading = false
    }

    func call(_ medicalID: Int, token: String) async {
        calling = true; errorMessage = nil
        do { try await APIClient(token: token).recordCall(medicalID); items = try await APIClient(token: token).dailyCalling() }
        catch { errorMessage = error.localizedDescription }
        calling = false
    }

    func setStatus(_ medicalID: Int, picked: Bool, token: String) async {
        do { try await APIClient(token: token).updateCallStatus(medicalID, picked: picked); items = try await APIClient(token: token).dailyCalling() }
        catch { errorMessage = error.localizedDescription }
    }
}
