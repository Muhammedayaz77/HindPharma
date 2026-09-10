package com.hindtechgroup.hindpharma.View

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
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
    HomeAction("Daily Calling", setOf("admin", "manager", "employee")),
    HomeAction("Medical List", setOf("admin", "manager", "employee")),
    HomeAction("Products", setOf("admin", "manager", "employee")),
    HomeAction("Order", setOf("admin", "manager", "employee")),
    HomeAction("Manager Dashboard", setOf("admin", "manager")),
    HomeAction("Admin Dashboard", setOf("admin")),
    HomeAction("HTG Super Admin", setOf("super_admin"))
)

@Composable
fun HomeView(viewModel: HomeViewModel = viewModel()) {
    val user = viewModel.sessionUser
    if (user == null) LoginView(viewModel) else ShopHomeView(user, viewModel)
}

@Composable
private fun LoginView(viewModel: HomeViewModel) {
    val scope = rememberCoroutineScope()
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("HIND PHARMA", style = MaterialTheme.typography.headlineMedium)
        Text("Login to start your shop work", modifier = Modifier.padding(top = 6.dp, bottom = 20.dp))

        OutlinedTextField(
            value = viewModel.username,
            onValueChange = { viewModel.username = it },
            label = { Text("Username") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = viewModel.password,
            onValueChange = { viewModel.password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
        )

        viewModel.errorMessage?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 10.dp))
        }

        Button(
            onClick = { scope.launch { viewModel.login() } },
            enabled = !viewModel.isLoading,
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
        ) {
            if (viewModel.isLoading) CircularProgressIndicator() else Text("LOGIN")
        }
    }
}

@Composable
private fun ShopHomeView(user: SessionUser, viewModel: HomeViewModel) {
    Column(modifier = Modifier.fillMaxSize().padding(20.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text(user.businessName ?: "Hind Pharma", style = MaterialTheme.typography.headlineSmall)
                Text("${user.username} · ${user.roleDisplayName}")
            }
            Button(onClick = viewModel::logout) { Text("Logout") }
        }

        Text("Home", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(top = 24.dp, bottom = 12.dp))
        LazyVerticalGrid(columns = GridCells.Fixed(2), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(homeActions.filter { user.role in it.roles }) { action ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { /* Feature screen is ported into this route next. */ }, modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                        Text(action.title)
                    }
                }
            }
        }
    }
}
