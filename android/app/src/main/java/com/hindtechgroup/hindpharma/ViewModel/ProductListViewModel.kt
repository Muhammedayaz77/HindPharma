package com.hindtechgroup.hindpharma.ViewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hindtechgroup.hindpharma.Helper.ApiClient
import com.hindtechgroup.hindpharma.Helper.Product
import kotlinx.coroutines.launch

class ProductListViewModel : ViewModel() {
    var products by mutableStateOf<List<Product>>(emptyList())
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
            try { products = ApiClient(token).getProducts() }
            catch (e: Exception) { errorMessage = e.message ?: "Could not load products." }
            finally { isLoading = false }
        }
    }

    val filtered: List<Product>
        get() {
            val q = search.trim().lowercase()
            if (q.isEmpty()) return products
            return products.filter { p ->
                listOf(p.name, p.company, p.formula, p.productId, p.code).filterNotNull().joinToString(" ").lowercase().contains(q)
            }
        }
}
