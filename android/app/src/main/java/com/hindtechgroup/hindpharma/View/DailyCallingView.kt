package com.hindtechgroup.hindpharma.View

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.ViewModel.DailyCallingViewModel

@Composable
fun DailyCallingView(user: SessionUser, onBack: () -> Unit, viewModel: DailyCallingViewModel = viewModel()) {
    val context = LocalContext.current
    LaunchedEffect(user.token) { viewModel.load(user.token) }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column { Text(user.businessName ?: "Hind Pharma", style = MaterialTheme.typography.titleLarge); Text("Daily Calling") }
            Button(onClick = onBack) { Text("HOME") }
        }
        viewModel.error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(vertical = 8.dp)) }
        if (viewModel.loading) CircularProgressIndicator(modifier = Modifier.padding(20.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(top = 12.dp)) {
            items(viewModel.items) { medical ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text(medical.name, style = MaterialTheme.typography.titleMedium)
                        medical.area?.let { Text(it) }
                        Text("Status: ${if (medical.isCall) "Called" else "Not Called"} · ${if (medical.isPick == true) "Picked" else if (medical.isNotPick == true) "Not Picked" else "Pending"}")
                        Button(enabled = !medical.isCall && !viewModel.calling, onClick = {
                            medical.phone?.let { phone ->
                                viewModel.call(medical.id, user.token)
                                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${phone.replace(Regex("[^0-9+]"), "")}")))
                            }
                        }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) { Text(medical.phone ?: "No mobile number") }
                        if (medical.isCall) {
                            Row(Modifier.fillMaxWidth()) {
                                RadioButton(selected = medical.isPick == true, onClick = { viewModel.setStatus(medical.id, true, user.token) })
                                Text("Picked", modifier = Modifier.padding(top = 12.dp))
                                RadioButton(selected = medical.isNotPick == true, onClick = { viewModel.setStatus(medical.id, false, user.token) })
                                Text("Not Picked", modifier = Modifier.padding(top = 12.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
