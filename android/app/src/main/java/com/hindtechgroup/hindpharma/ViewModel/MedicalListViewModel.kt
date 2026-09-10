package com.hindtechgroup.hindpharma.ViewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hindtechgroup.hindpharma.Helper.ApiClient
import com.hindtechgroup.hindpharma.Helper.Medical
import kotlinx.coroutines.launch

class MedicalListViewModel : ViewModel() {
    var medicals by mutableStateOf<List<Medical>>(emptyList())
        private set
    var search by mutableStateOf("")
    var isLoading by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set

    fun load(token: String?) {
        if (isLoading) return
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            try { medicals = ApiClient(token).getMedicals() }
            catch (e: Exception) { errorMessage = e.message ?: "Medical list could not be loaded." }
            finally { isLoading = false }
        }
    }

    val filtered: List<Medical>
        get() {
            val q = search.trim().lowercase()
            return medicals.filter { q.isEmpty() || "${it.name} ${it.area ?: ""}".lowercase().contains(q) }
        }
}
