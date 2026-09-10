package com.hindtechgroup.hindpharma.ViewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.hindtechgroup.hindpharma.Helper.ApiClient
import com.hindtechgroup.hindpharma.Models.*
import com.hindtechgroup.hindpharma.Helper.*
import kotlinx.coroutines.launch
import androidx.lifecycle.viewModelScope

class DailyCallingViewModel : ViewModel() {
    var items by mutableStateOf<List<CallingMedical>>(emptyList()); private set
    var loading by mutableStateOf(false); private set
    var calling by mutableStateOf(false); private set
    var error by mutableStateOf<String?>(null); private set
    fun load(token: String) { viewModelScope.launch { loading = true; error = null; runCatching { ApiClient(token).getDailyCalling() }.onSuccess { items = it }.onFailure { error = it.message }.also { loading = false } } }
    fun call(id: Int, token: String) { viewModelScope.launch { calling = true; error = null; runCatching { ApiClient(token).recordCall(id); ApiClient(token).getDailyCalling() }.onSuccess { items = it }.onFailure { error = it.message }.also { calling = false } } }
    fun setStatus(id: Int, picked: Boolean, token: String) { viewModelScope.launch { runCatching { ApiClient(token).updateCallStatus(id, picked); ApiClient(token).getDailyCalling() }.onSuccess { items = it }.onFailure { error = it.message } } }
}
