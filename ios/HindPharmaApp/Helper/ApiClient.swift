import Foundation

struct APIClient {
 let token:String?
 private func request(path:String,method:String="GET",body:Data?=nil) async throws -> Data { let base=AppConfig.apiBaseURL.absoluteString.trimmingCharacters(in:CharacterSet(charactersIn:"/")); guard let url=URL(string:"\(base)/\(path)") else{throw APIError.server("Invalid API URL")}; var r=URLRequest(url:url);r.httpMethod=method;r.setValue("application/json",forHTTPHeaderField:"Accept");if let token,!token.isEmpty{r.setValue("Bearer \(token)",forHTTPHeaderField:"Authorization")};if let body{r.httpBody=body;r.setValue("application/json",forHTTPHeaderField:"Content-Type")};let(data,response)=try await URLSession.shared.data(for:r);guard let h=response as? HTTPURLResponse,(200...299).contains(h.statusCode) else{let d=(try? JSONSerialization.jsonObject(with:data) as? [String:Any])?["detail"] as? String;throw APIError.server(d ?? "Request failed")};return data }
 func dailyCalling()async throws->[CallingMedical]{try await decode([CallingMedical].self,path:"calling/today")}
 func medicals()async throws->[Medical]{try await decode([Medical].self,path:"medicals")}
 func products(search:String="")async throws->[Product]{try await decode([Product].self,path:"products?search=\(search.addingPercentEncoding(withAllowedCharacters:.urlQueryAllowed) ?? "")")}
 func users()async throws->[TenantUser]{try await decode([TenantUser].self,path:"users")}
 func superAdminDashboard()async throws->SuperAdminDashboard{try await decode(SuperAdminDashboard.self,path:"super-admin/dashboard")}
 func recordCall(_ id:Int)async throws{_=try await request(path:"calling/\(id)/call",method:"POST",body:Data("{}".utf8))}
 func updateCallStatus(_ id:Int,picked:Bool)async throws{_=try await request(path:"calling/\(id)/status",method:"PATCH",body:try JSONSerialization.data(withJSONObject:["is_pick":picked]))}
 func createOrder(medicalID:Int?,items:[OrderItem])async throws{var d:[String:Any]=["items":items.map{["product_id":$0.productId,"quantity":$0.quantity,"price":$0.price as Any] }];if let medicalID{d["medical_id"]=medicalID};_=try await request(path:"orders",method:"POST",body:JSONSerialization.data(withJSONObject:d))}
 private func decode<T:Decodable>(_ type:T.Type,path:String)async throws->T{try JSONDecoder().decode(T.self,from:try await request(path:path))}
}
enum APIError:LocalizedError{case server(String);var errorDescription:String?{if case .server(let v)=self{return v};return nil}}
struct Medical:Codable,Identifiable{let id:Int;let name:String;let area:String?;let phone:String?}
struct Product:Codable,Identifiable{let id:Int;let product_id:String?;let code:String?;let name:String;let unit:String?;let mrp:Double?;let formula:String?;let company:String?}
struct CallingMedical:Codable,Identifiable{let id:Int;let name:String;let phone:String?;let area:String?;let is_call:Int;let is_pick:Int?;let is_not_pick:Int?;var isCalled:Bool{is_call==1}}
struct OrderItem:Codable{let productId:Int;let quantity:Int;let price:Double?;enum CodingKeys:String,CodingKey{case productId="product_id",quantity,price}}
struct TenantUser:Codable,Identifiable{let id:Int;let username:String;let role:String;let name:String?;let phone:String?;let is_active:Int}
struct AdminSummary:Codable,Identifiable{let id:Int;let username:String;let name:String?;let business_name:String;let is_active:Int;let subscription_plan:String?;let subscription_start:String?;let subscription_expiry:String?}
struct SuperAdminDashboard:Codable{let admins:[AdminSummary]}
