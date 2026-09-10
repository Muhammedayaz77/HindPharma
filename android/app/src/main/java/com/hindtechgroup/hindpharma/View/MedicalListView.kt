package com.hindtechgroup.hindpharma.View

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.ViewModel.MedicalListViewModel

@Composable
fun MedicalListView(user: SessionUser, onBack: () -> Unit, viewModel: MedicalListViewModel = viewModel()) {
    LaunchedEffect(user.token) { viewModel.load(user.token) }
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Select Medical", style = MaterialTheme.typography.headlineSmall)
            TextButton(onClick = onBack) { Text("Home") }
        }
        OutlinedTextField(viewModel.search, { viewModel.search = it }, label = { Text("Search medical name or area...") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp))
        viewModel.errorMessage?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        if (viewModel.isLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxSize()) {
            items(viewModel.filtered, key = { it.id }) { medical ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text(medical.name, style = MaterialTheme.typography.titleMedium)
                        medical.area?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }
                        medical.phone?.let { phone ->
                            TextButton(onClick = { runCatching { val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone")); androidx.compose.ui.platform.LocalContext.current.startActivity(intent) } }) { Text(phone) }
                        }
                    }
                }
            }
        }
    }
}
