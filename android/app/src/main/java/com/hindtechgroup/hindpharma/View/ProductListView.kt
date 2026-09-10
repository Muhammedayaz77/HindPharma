package com.hindtechgroup.hindpharma.View

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.ViewModel.ProductListViewModel

@Composable
fun ProductListView(user: SessionUser, onBack: () -> Unit, viewModel: ProductListViewModel = viewModel()) {
    LaunchedEffect(user.token) { viewModel.load(user.token) }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Select Products", style = MaterialTheme.typography.headlineSmall)
            TextButton(onClick = onBack) { Text("Back") }
        }
        OutlinedTextField(viewModel.search, { viewModel.search = it }, label = { Text("Search product, company or formula...") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp))
        viewModel.errorMessage?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        if (viewModel.isLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
        Text("${viewModel.filtered.size} products found", modifier = Modifier.padding(bottom = 8.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxSize()) {
            items(viewModel.filtered, key = { it.id }) { product ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text(product.name, style = MaterialTheme.typography.titleMedium)
                        product.company?.let { Text(it) }
                        product.formula?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                        product.mrp?.let { Text("MRP: ₹$it", style = MaterialTheme.typography.bodySmall) }
                    }
                }
            }
        }
    }
}
