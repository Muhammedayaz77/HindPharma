package com.hindtechgroup.hindpharma.View

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.hindtechgroup.hindpharma.Models.CartItem
import com.hindtechgroup.hindpharma.Models.SelectedMedical
import com.hindtechgroup.hindpharma.Models.SessionUser

@Composable
fun OrderView(user: SessionUser, medical: SelectedMedical, initialItems: List<CartItem>, onBack: () -> Unit, onNewOrder: () -> Unit) {
    var order by remember { mutableStateOf(initialItems) }
    var final by remember { mutableStateOf(false) }
    if (final) {
        FinalOrderView(user, medical, order, onNewOrder)
        return
    }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Current Order", style = MaterialTheme.typography.headlineSmall)
            TextButton(onClick = onBack) { Text("Add more products") }
        }
        Text("Medical: ${medical.name}", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 12.dp))
        if (order.isEmpty()) Text("Your order is empty.")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
            itemsIndexed(order) { index, item ->
                Card(Modifier.fillMaxWidth()) {
                    Row(Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("${index + 1}. ${item.name}", modifier = Modifier.weight(1f))
                        Row {
                            TextButton(onClick = { order = order.mapIndexed { i, v -> if (i == index) v.copy(quantity = (v.quantity - 1).coerceAtLeast(1)) else v } }) { Text("−") }
                            Text("${item.quantity} ${item.unit}", modifier = Modifier.padding(top = 8.dp))
                            TextButton(onClick = { order = order.mapIndexed { i, v -> if (i == index) v.copy(quantity = v.quantity + 1) else v } }) { Text("+") }
                            TextButton(onClick = { order = order.filterIndexed { i, _ -> i != index } }) { Text("×") }
                        }
                    }
                }
            }
        }
        Button(onClick = { final = true }, enabled = order.isNotEmpty(), modifier = Modifier.fillMaxWidth()) { Text("FINAL ORDER") }
    }
}

@Composable
private fun FinalOrderView(user: SessionUser, medical: SelectedMedical, order: List<CartItem>, onNewOrder: () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val text = buildString {
        append("*#${medical.name}*\n\n")
        order.forEachIndexed { index, item -> append("${index + 1}. ${item.name} ----> ${item.quantity} ${item.unit}\n") }
    }.trimEnd()
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Final Order", style = MaterialTheme.typography.headlineSmall)
        Text(text, modifier = Modifier.weight(1f).padding(top = 20.dp))
        Button(onClick = {
            val url = "https://wa.me/919028773301?text=" + Uri.encode(text)
            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }, modifier = Modifier.fillMaxWidth()) { Text("SEND ON WHATSAPP") }
        OutlinedButton(onClick = onNewOrder, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) { Text("START NEW ORDER") }
        Text("Logged in as: ${user.username}", style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 12.dp))
    }
}
