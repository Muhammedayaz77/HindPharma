package com.hindtechgroup.hindpharma.View

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Helper.Product
import com.hindtechgroup.hindpharma.Models.CartItem
import com.hindtechgroup.hindpharma.Models.SelectedMedical
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.ViewModel.ProductListViewModel

private val orderUnits = listOf("PIECE", "BOX", "CASE", "STRIP", "PACK", "BOTTLE", "TUBE", "VIAL", "OTHER")

@Composable
fun ProductListView(user: SessionUser, medical: SelectedMedical, onBack: () -> Unit, onOrder: (List<CartItem>) -> Unit, viewModel: ProductListViewModel = viewModel()) {
    var cart by remember { mutableStateOf<List<CartItem>>(emptyList()) }
    var selected by remember { mutableStateOf<Product?>(null) }
    LaunchedEffect(user.token) { viewModel.load(user.token) }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Select Products", style = MaterialTheme.typography.headlineSmall)
            TextButton(onClick = { onOrder(cart) }) { Text("Order (${cart.size})") }
        }
        Text("Medical: ${medical.name}", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(viewModel.search, { viewModel.search = it }, label = { Text("Search product...") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp))
        viewModel.errorMessage?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        if (viewModel.isLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
        Text("${viewModel.filtered.size} products found", modifier = Modifier.padding(bottom = 8.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
            items(viewModel.filtered, key = { it.id }) { product ->
                Card(onClick = { selected = product }, modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text(product.name, style = MaterialTheme.typography.titleMedium)
                        product.company?.let { Text(it) }
                        product.formula?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                        product.mrp?.let { Text("MRP: ₹$it", style = MaterialTheme.typography.bodySmall) }
                        Text("Tap to add", style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }
    }
    selected?.let { product ->
        ProductQuantityDialog(product, { quantity, unit ->
            cart = cart + CartItem(product.id, product.name, quantity, unit)
            selected = null
        }, { selected = null })
    }
}

@Composable
private fun ProductQuantityDialog(product: Product, onAdd: (Int, String) -> Unit, onDismiss: () -> Unit) {
    var quantityText by remember { mutableStateOf("1") }
    var unit by remember { mutableStateOf("PIECE") }
    var expanded by remember { mutableStateOf(false) }
    AlertDialog(onDismissRequest = onDismiss, title = { Text(product.name) }, text = {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(quantityText, { quantityText = it.filter(Char::isDigit) }, label = { Text("Quantity") }, singleLine = true)
            Box {
                OutlinedButton(onClick = { expanded = true }) { Text(unit) }
                DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                    orderUnits.forEach { option -> DropdownMenuItem(text = { Text(option) }, onClick = { unit = option; expanded = false }) }
                }
            }
        }
    }, confirmButton = { Button(onClick = { onAdd(quantityText.toIntOrNull()?.coerceAtLeast(1) ?: 1, unit) }) { Text("Add to Order") } }, dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } })
}
