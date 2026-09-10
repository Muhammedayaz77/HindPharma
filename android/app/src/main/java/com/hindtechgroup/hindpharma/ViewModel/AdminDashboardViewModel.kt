package com.hindtechgroup.hindpharma.ViewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hindtechgroup.hindpharma.Helper.ApiClient
import kotlinx.coroutines.launch

class AdminDashboardViewModel: ViewModel(){
 var userCount by mutableStateOf(0); private set; var medicalCount by mutableStateOf(0); private set; var productCount by mutableStateOf(0); private set; var isLoading by mutableStateOf(false); private set; var errorMessage by mutableStateOf<String?>(null); private set
 fun load(token:String?){if(isLoading)return;viewModelScope.launch{isLoading=true;errorMessage=null;try{val api=ApiClient(token);userCount=api.getUsers().count{it.isActive};medicalCount=api.getMedicals().size;productCount=api.getProducts().size}catch(e:Exception){errorMessage=e.message?:"Dashboard could not be loaded."}finally{isLoading=false}}}
}
