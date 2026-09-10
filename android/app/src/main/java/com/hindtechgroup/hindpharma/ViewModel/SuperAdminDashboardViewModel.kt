package com.hindtechgroup.hindpharma.ViewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hindtechgroup.hindpharma.Helper.ApiClient
import kotlinx.coroutines.launch

class SuperAdminDashboardViewModel:ViewModel(){var businesses by mutableStateOf(emptyList<com.hindtechgroup.hindpharma.Helper.AdminSummary>());private set;var isLoading by mutableStateOf(false);private set;var errorMessage by mutableStateOf<String?>(null);private set;fun load(token:String?){if(isLoading)return;viewModelScope.launch{isLoading=true;errorMessage=null;try{businesses=ApiClient(token).getSuperAdminDashboard().admins}catch(e:Exception){errorMessage=e.message?:"Dashboard could not be loaded."}finally{isLoading=false}}}}
