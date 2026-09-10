import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Text("Hind Pharma")
                    .font(.title)
                    .fontWeight(.semibold)
            }
            .navigationTitle("Hind Pharma")
        }
    }
}

#Preview {
    HomeView()
}
