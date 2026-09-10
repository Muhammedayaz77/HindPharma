import Foundation

struct APIClient {
    let token: String?
    private func request(path: String, method: String = "GET", body: Data? = nil) async throws -> Data {
        let base = AppConfig.apiBaseURL.absoluteString.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard let url = URL(string: "\(base)/\(path)") else { throw APIError.server("Invalid API URL") }
        var request = URLRequest(url: url); request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token, !token.isEmpty { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { request.httpBody = body; request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            let detail = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["detail"] as? String
            throw APIError.server(detail ?? "Request failed")
        }
        return data
    }
    func dailyCalling() async throws -> [CallingMedical] { try await decode([CallingMedical].self, path: "calling/today") }
    func medicals() async throws -> [Medical] { try await decode([Medical].self, path: "medicals") }
    func products(search: String = "") async throws -> [Product] { try await decode([Product].self, path: "products?search=\(search.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") }
    func recordCall(_ medicalID: Int) async throws { _ = try await request(path: "calling/\(medicalID)/call", method: "POST", body: Data("{}".utf8)) }
    func updateCallStatus(_ medicalID: Int, picked: Bool) async throws { _ = try await request(path: "calling/\(medicalID)/status", method: "PATCH", body: try JSONSerialization.data(withJSONObject: ["is_pick": picked])) }
    private func decode<T: Decodable>(_ type: T.Type, path: String) async throws -> T { try JSONDecoder().decode(T.self, from: try await request(path: path)) }
}

enum APIError: LocalizedError { case server(String); var errorDescription: String? { if case .server(let value) = self { return value }; return nil } }
struct Medical: Codable, Identifiable { let id: Int; let name: String; let area: String?; let phone: String? }
struct Product: Codable, Identifiable { let id: Int; let product_id: String?; let code: String?; let name: String; let unit: String?; let mrp: Double?; let formula: String?; let company: String? }
struct CallingMedical: Codable, Identifiable { let id: Int; let name: String; let phone: String?; let area: String?; let is_call: Int; let is_pick: Int?; let is_not_pick: Int?; var isCalled: Bool { is_call == 1 } }
