package com.hindtechgroup.hindpharma.Helper

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class ApiClient(private val token: String? = null) {
    private suspend fun request(path: String, method: String = "GET", body: String? = null): String = withContext(Dispatchers.IO) {
        val connection = (URL("${AppConfig.apiBaseUrl}$path").openConnection() as HttpURLConnection)
        connection.requestMethod = method
        connection.connectTimeout = 10_000
        connection.readTimeout = 10_000
        connection.setRequestProperty("Accept", "application/json")
        token?.takeIf { it.isNotBlank() }?.let { connection.setRequestProperty("Authorization", "Bearer $it") }
        if (body != null) {
            connection.setRequestProperty("Content-Type", "application/json")
            connection.doOutput = true
            connection.outputStream.use { it.write(body.toByteArray()) }
        }
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val response = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        connection.disconnect()
        if (code !in 200..299) {
            val message = runCatching { JSONObject(response).optString("detail") }.getOrNull()
            throw IllegalStateException(message?.ifBlank { null } ?: "Request failed ($code)")
        }
        response
    }

    suspend fun getMedicals(): List<Medical> = JSONArray(request("/medicals")).let { array ->
        List(array.length()) { i -> Medical.fromJson(array.getJSONObject(i)) }
    }

    suspend fun getProducts(search: String = ""): List<Product> = JSONArray(request("/products?search=${java.net.URLEncoder.encode(search, "UTF-8")}")).let { array ->
        List(array.length()) { i -> Product.fromJson(array.getJSONObject(i)) }
    }

    suspend fun getDailyCalling(): List<CallingMedical> = JSONArray(request("/calling/today")).let { array ->
        List(array.length()) { i -> CallingMedical.fromJson(array.getJSONObject(i)) }
    }

    suspend fun recordCall(medicalId: Int) = request("/calling/$medicalId/call", "POST", "{}")

    suspend fun updateCallStatus(medicalId: Int, picked: Boolean) = request("/calling/$medicalId/status", "PATCH", JSONObject().put("is_pick", picked).toString())

    suspend fun createOrder(medicalId: Int?, items: List<OrderItem>) = request(
        "/orders", "POST", JSONObject().apply {
            if (medicalId != null) put("medical_id", medicalId)
            put("items", JSONArray(items.map { JSONObject().put("product_id", it.productId).put("quantity", it.quantity).put("price", it.price) }))
        }.toString()
    )
}

data class Medical(val id: Int, val name: String, val area: String?, val phone: String?) {
    companion object { fun fromJson(j: JSONObject) = Medical(j.optInt("id"), j.optString("name"), j.optString("area").ifBlank { null }, j.optString("phone").ifBlank { null }) }
}
data class Product(val id: Int, val productId: String?, val code: String?, val name: String, val unit: String?, val mrp: Double?, val formula: String?, val company: String?) {
    companion object { fun fromJson(j: JSONObject) = Product(j.optInt("id"), j.optString("product_id").ifBlank { null }, j.optString("code").ifBlank { null }, j.optString("name"), j.optString("unit").ifBlank { null }, if (j.isNull("mrp")) null else j.optDouble("mrp"), j.optString("formula").ifBlank { null }, j.optString("company").ifBlank { null }) }
}
data class CallingMedical(val id: Int, val name: String, val phone: String?, val area: String?, val isCall: Boolean, val isPick: Boolean?, val isNotPick: Boolean?) {
    companion object { fun fromJson(j: JSONObject) = CallingMedical(j.optInt("id"), j.optString("name"), j.optString("phone").ifBlank { null }, j.optString("area").ifBlank { null }, j.optInt("is_call") == 1, if (j.isNull("is_pick")) null else j.optInt("is_pick") == 1, if (j.isNull("is_not_pick")) null else j.optInt("is_not_pick") == 1) }
}
data class OrderItem(val productId: Int, val quantity: Int, val price: Double?)
