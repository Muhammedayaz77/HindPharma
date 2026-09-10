package com.hindtechgroup.hindpharma.View

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.Models.roleDisplayName
import com.hindtechgroup.hindpharma.ViewModel.HomeViewModel
import kotlinx.coroutines.launch

private data class HomeAction(val title: String, val roles: Set<String>)
private val homeActions = listOf(
    HomeAction("Daily Calling", setOf("admin", "manager", "employee")), HomeAction("Medical List", setOf("admin", "manager", "employee")),
    HomeAction("Products", setOf("admin", "manager", "employee")), HomeAction("Order", setOf("admin", "manager", "employee")),
    HomeAction("Manager Dashboard", setOf("admin", "manager")), HomeAction("Admin Dashboard", setOf("admin")), HomeAction("HTG Super Admin", setOf("super_admin"))
)

@Composable
fun HomeView(viewModel: HomeViewModel = viewModel()) {
    val user = viewModel.sessionUser
    if (user == null) LoginView(viewModel) else ShopHomeView(user, viewModel)
}

@Composable
private fun LoginView(viewModel: HomeViewModel) {
    val scope = rememberCoroutineScope()
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
        Text("HIND PHARMA", style = MaterialTheme.typography.headlineMedium)
        Text("Login to start your shop work", modifier = Modifier.padding(top = 6.dp, bottom = 20.dp))
        OutlinedTextField(viewModel.username, { viewModel.username = it }, label = { Text("Username") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(viewModel.password, { viewModel.password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), singleLine = true, modifier = Modifier.fillMaxWidth().padding(top = 12.dp))
        viewModel.errorMessage?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 10.dp)) }
        Button(onClick = { scope.launch { viewModel.login() } }, enabled = !viewModel.isLoading, modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
            if (viewModel.isLoading) CircularProgressIndicator() else Text("LOGIN")
        }
    }
}

@Composable
private fun ShopHomeView(user: SessionUser, viewModel: HomeViewModel) {
    var route by remember { mutableStateOf<String?>(null) }
    when (route) {
        "Daily Calling" -> { DailyCallingView(user, { route = null }); return }
        "Medical List" -> { MedicalListView(user, { route = null }); return }
    }
    Column(Modifier.fillMaxSize().padding(20.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column { Text(user.businessName ?: "Hind Pharma", style = MaterialTheme.typography.headlineSmall); Text("${user.username} · ${user.roleDisplayName}") }
            Button(onClick = viewModel::logout) { Text("Logout") }
        }
        Text("Home", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(top = 24.dp, bottom = 12.dp))
        LazyVerticalGrid(columns = GridCells.Fixed(2), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(homeActions.filter { user.role in it.roles }) { action ->
                Card(Modifier.fillMaxWidth()) { Button(onClick = { route = action.title }, Modifier.fillMaxWidth().padding(8.dp)) { Text(action.title) } }
            }
        }
    }
}
