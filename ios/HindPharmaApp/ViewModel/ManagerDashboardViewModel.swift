import Foundation
import Combine
@MainActor final class ManagerDashboardViewModel: ObservableObject {
 @Published var employeeCount=0; @Published var medicalCount=0; @Published var productCount=0; @Published var isLoading=false; @Published var errorMessage:String?
 func load(token:String?) async { guard !isLoading else{return}; isLoading=true; defer{isLoading=false}; do { let api=APIClient(token:token); async let u=api.users(); async let m=api.medicals(); async let p=api.products(); employeeCount=(try await u).filter{$0.role=="employee" && $0.is_active==1}.count; medicalCount=(try await m).count; productCount=(try await p).count } catch { errorMessage=error.localizedDescription } }
}