package com.hindtechgroup.hindpharma.View

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.ViewModel.SuperAdminDashboardViewModel

@Composable
fun SuperAdminDashboardView(user: SessionUser, onBack: () -> Unit, viewModel: SuperAdminDashboardViewModel = viewModel()) {
    LaunchedEffect(user.token) { viewModel.load(user.token) }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("HTG Super Admin", style = MaterialTheme.typography.headlineSmall)
            TextButton(onClick = onBack) { Text("Home") }
        }
        viewModel.errorMessage?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        if (viewModel.isLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
        Text("Businesses: ${viewModel.businesses.size}", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(vertical = 12.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(viewModel.businesses, key = { it.id }) { business ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text(business.businessName, style = MaterialTheme.typography.titleMedium)
                        Text("Admin: ${business.username}")
                        Text(if (business.isActive) "ACTIVE" else "INACTIVE")
                        business.subscriptionExpiry?.let { Text("Expiry: $it", style = MaterialTheme.typography.bodySmall) }
                    }
                }
            }
        }
    }
}
