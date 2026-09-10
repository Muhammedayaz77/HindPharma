package com.hindtechgroup.hindpharma.ViewModel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.hindtechgroup.hindpharma.Helper.AppConfig
import com.hindtechgroup.hindpharma.Models.SessionUser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class HomeViewModel : ViewModel() {
    var username by mutableStateOf("")
    var password by mutableStateOf("")
    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)
    var sessionUser by mutableStateOf<SessionUser?>(null)
        private set

    suspend fun login() {
        val cleanUsername = username.trim()
        if (cleanUsername.isEmpty()) {
            errorMessage = "Username is required."
            return
        }
        if (password.isEmpty()) {
            errorMessage = "Password is required."
            return
        }

        isLoading = true
        errorMessage = null
        try {
            sessionUser = withContext(Dispatchers.IO) {
                val connection = (URL("${AppConfig.apiBaseUrl}/login").openConnection() as HttpURLConnection)
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.connectTimeout = 10_000
                connection.readTimeout = 10_000
                connection.doOutput = true
                connection.outputStream.use {
                    it.write(JSONObject().apply {
                        put("username", cleanUsername)
                        put("password", password)
                    }.toString().toByteArray())
                }

                val responseCode = connection.responseCode
                val stream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
                val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
                connection.disconnect()

                if (responseCode !in 200..299) {
                    val message = runCatching { JSONObject(body).optString("detail") }.getOrNull()
                    throw IllegalStateException(message?.ifBlank { null } ?: "Invalid username or password")
                }

                val json = JSONObject(body)
                SessionUser(
                    id = json.optString("id"),
                    username = json.optString("username"),
                    role = json.optString("role", "employee"),
                    adminId = if (json.isNull("admin_id")) null else json.optString("admin_id"),
                    businessName = if (json.isNull("business_name")) null else json.optString("business_name"),
                    subscriptionExpiry = if (json.isNull("subscription_expiry")) null else json.optString("subscription_expiry"),
                    token = json.optString("token")
                )
            }
            password = ""
        } catch (error: Exception) {
            errorMessage = error.message ?: "Unable to complete login."
            sessionUser = null
        } finally {
            isLoading = false
        }
    }

    fun logout() {
        sessionUser = null
        username = ""
        password = ""
        errorMessage = null
    }
}
