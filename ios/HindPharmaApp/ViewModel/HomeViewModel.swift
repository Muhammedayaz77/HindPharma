import Combine
import Foundation

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var username = ""
    @Published var password = ""
    @Published private(set) var sessionUser: SessionUser?
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?

    func login() async {
        let cleanUsername = username.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanUsername.isEmpty else {
            errorMessage = "Username is required."
            return
        }
        guard !password.isEmpty else {
            errorMessage = "Password is required."
            return
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            var request = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("login"))
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: ["username": cleanUsername, "password": password])

            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                let detail = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["detail"] as? String
                throw LoginError.server(detail ?? "Invalid username or password")
            }

            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let responseUsername = json["username"] as? String,
                  let role = json["role"] as? String,
                  let token = json["token"] as? String else {
                throw LoginError.server("Invalid login response")
            }

            sessionUser = SessionUser(
                id: String(describing: json["id"] ?? ""),
                username: responseUsername,
                role: role,
                adminID: json["admin_id"].map { String(describing: $0) },
                businessName: json["business_name"] as? String,
                subscriptionExpiry: json["subscription_expiry"] as? String,
                token: token
            )
            password = ""
        } catch {
            sessionUser = nil
            errorMessage = error.localizedDescription
        }
    }

    func logout() {
        sessionUser = nil
        username = ""
        password = ""
        errorMessage = nil
    }

    private enum LoginError: LocalizedError {
        case server(String)
        var errorDescription: String? {
            switch self {
            case .server(let message): return message
            }
        }
    }
}
