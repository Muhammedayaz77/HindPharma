package com.hindtechgroup.hindpharma.View

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindtechgroup.hindpharma.Models.SessionUser
import com.hindtechgroup.hindpharma.ViewModel.AdminDashboardViewModel

@Composable fun AdminDashboardView(user:SessionUser,onBack:()->Unit,viewModel:AdminDashboardViewModel=viewModel()){LaunchedEffect(user.token){viewModel.load(user.token)};Column(Modifier.fillMaxSize().padding(20.dp)){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("Admin Dashboard",style=MaterialTheme.typography.headlineSmall);TextButton(onClick=onBack){Text("Home")}};viewModel.errorMessage?.let{Text(it,color=MaterialTheme.colorScheme.error)};if(viewModel.isLoading)LinearProgressIndicator(Modifier.fillMaxWidth());Spacer(Modifier.height(16.dp));Text("Business Control Center",style=MaterialTheme.typography.titleMedium);StatCard("ACTIVE USERS",viewModel.userCount);StatCard("MEDICALS",viewModel.medicalCount);StatCard("PRODUCTS",viewModel.productCount)}}
@Composable private fun StatCard(label:String,value:Int){Card(Modifier.fillMaxWidth().padding(vertical=5.dp)){Column(Modifier.padding(16.dp)){Text(label);Text(value.toString(),style=MaterialTheme.typography.headlineMedium)}}}
