package com.hindtechgroup.hindpharma.Models

data class SelectedMedical(val id: Int, val name: String)
data class CartItem(val productId: Int?, val name: String, val quantity: Int, val unit: String, val temporary: Boolean = false)
