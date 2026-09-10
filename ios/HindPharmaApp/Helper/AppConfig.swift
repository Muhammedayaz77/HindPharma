import Foundation

enum AppConfig {
    static let appName = "Hind Pharma"
    // iOS Simulator can reach a backend running on the developer machine via localhost.
    static let apiBaseURL = URL(string: "http://127.0.0.1:8000/api")!
}
