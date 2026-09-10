package com.hindtechgroup.hindpharma.Models

data class SessionUser(
    val id: String,
    val username: String,
    val role: String,
    val adminId: String? = null,
    val businessName: String? = null,
    val subscriptionExpiry: String? = null,
    val token: String
)

val SessionUser.roleDisplayName: String
    get() = when (role) {
        "super_admin" -> "HTG Super Admin"
        "admin" -> "Admin"
        "manager" -> "Manager"
        else -> "Employee"
    }
