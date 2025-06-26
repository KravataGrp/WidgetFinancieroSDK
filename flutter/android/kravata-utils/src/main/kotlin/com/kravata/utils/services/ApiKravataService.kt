package com.kravata.utils.services

import okhttp3.*
import android.provider.Settings
import android.content.Context
import android.util.Log
import com.kravata.utils.models.DataType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.Base64


class ApiKravataService(
    private val context: Context,
    private val storage: SecurityStorageService,
    private val client: OkHttpClient
) {

    private suspend fun getPrivateKeyTemp(): String? = withContext(Dispatchers.IO) {
        try {
            val subdomain = storage.getKey(DataType.SUBDOMAIN) ?: "v4ky7utf2gzo"
            val domain = storage.getKey(DataType.DOMAIN) ?: "v4ky7utf2gzo"

            val baseUrl = "https://$subdomain.$domain"
            val url = "$baseUrl/api/settings/keyaccestemp"

            val apiKey = storage.getKey(DataType.APIKEY)
            val secretKey = storage.getKey(DataType.SECRETKEY)

            val payload = JSONObject().apply {
                put("apiKey", apiKey)
                put("secretKey", secretKey)
            }

            //Log.i("ApiKravataService", "La url para obtener la llave es: " + url)
            val request = Request.Builder()
                .url(url)
                .post(
                    RequestBody.create("application/json".toMediaTypeOrNull(), payload.toString())
                )
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return@withContext null

            val bodyString = response.body?.string() ?: return@withContext null
            val json = JSONObject(bodyString)
            return@withContext json.optString("tempKey", null)
        } catch (e: Exception) {
            Log.e("ApiKravataService", "Error al obtener la private Key Temp.", e)
            e.printStackTrace()
            return@withContext null
        }
    }

    private suspend fun getWidgetUrl(
        textEncrypted: String, hmac: String, timestamp: String,  subdomain: String, domain: String
    ) : String = withContext(Dispatchers.IO) {
        try {
            val payload = JSONObject().apply {
                put("textEncrypted", textEncrypted)
                put("hmac", hmac)
                put("timestamp", timestamp)
            }

            val url = "https://$subdomain.$domain/api/settings/urlwidget"
            val request = Request.Builder()
                .url(url)
                .post(RequestBody.create("application/json".toMediaTypeOrNull(), payload.toString()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return@withContext ""

            val json = JSONObject(response.body?.string() ?: return@withContext "")
            return@withContext json.optString("urlAccess", null)
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext ""
        }
    }

    public fun getDeviceId() : String {
        return "Device2"
        //return Settings.Secure.getString(this.context.contentResolver, Settings.Secure.ANDROID_ID)
    }

    public suspend fun setParameters(params: Map<String, String>) {
        params.forEach { (key, value) ->
            val dataType = DataType.values().find { it.name == key.uppercase() }
            if (dataType != null) {
                storage.saveKey(dataType, value)
            }
        }
    }

    suspend fun getUrlWidget(
        phoneClient: String, countryCode: String
    ) : String {
//        val urlWidget = storage.getKey(DataType.URLWIDGET)

//        if (urlWidget.isNullOrBlank()) {
            val publicKeyECC = storage.getKey(DataType.PUBLICKEYECC) ?: ""
            val saltNonce = storage.getKey(DataType.SALTNONCE) ?: ""
            val saltHmac = storage.getKey(DataType.SALTHMAC) ?: ""
            val domain = storage.getKey(DataType.DOMAIN) ?: throw Exception("Domain missing")

            println("Va a buscar la llave en la nube")
            val privateKeyTemp = getPrivateKeyTemp()
                ?: throw Exception("Private Temp Key invalid")

            val deviceId = getDeviceId()

            val jsonEncrypt = JSONObject().apply {
                put("clientNumber", "+$countryCode$phoneClient")
                put("deviceId", deviceId)
            }

            println("Procede a encriptar")

            val encryptService = CryptoService()
            val encryptedData = encryptService.encryptData(
                jsonEncrypt.toString(),
                publicKeyECC,
                privateKeyTemp,
                saltNonce,
                saltHmac
            )

            println("data encriptada: $encryptedData")

            val subdomain = storage.getKey(DataType.SUBDOMAIN) ?: "v4ky7utf2gzo"
            val url = getWidgetUrl(encryptedData.textEncrypted, encryptedData.hmac, encryptedData.timestamp, subdomain, domain)
            println("Url de widget es: $url")
            // Guardar local
            if (!url.isNullOrBlank()){
                storage.saveKey(DataType.URLWIDGET, url)
            }
            return url
//        }
//        return urlWidget
    }

    suspend fun registerAccessMode(
        tokens: Map<String, String>, userId: String, apiKey: String, secretKey: String
    ): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val subdomain = storage.getKey(DataType.SUBDOMAIN) ?: "v4ky7utf2gzo"
            val domain = storage.getKey(DataType.DOMAIN)

            val payload = JSONObject().apply {
                put("userId", userId)
                put("keyName", "biometric")
                put("accessKey", apiKey)
                put("privateKey", secretKey)
                put("boosterKey", "")
                put("metadataAccess", "{}")
            }

            val headers = Headers.Builder()
                .add("Authorization", "Bearer ${tokens["accessToken"]}")
                .add("Content-Type", "application/json")
                .add("X-Device-ID", getDeviceId())
                .build()

            val request = Request.Builder()
                .url("https://$subdomain.$domain/api/token/register")
                .headers(headers)
                .post(payload.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return@withContext null

            return@withContext JSONObject(response.body?.string() ?: "")
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }

    suspend fun loginBiometric(
        apiKey: String, secretKey: String
    ): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val subdomain = storage.getKey(DataType.SUBDOMAIN) ?: "v4ky7utf2gzo"
            val domain = storage.getKey(DataType.DOMAIN)

            val payload = "grant_type=password&accessKey=$apiKey&privateKey=$secretKey&scope=private"

            val basicAuth = Base64.getEncoder().encodeToString("$apiKey:$secretKey".toByteArray())

            val headers = Headers.Builder()
                .add("Authorization", "Basic $basicAuth")
                .add("Content-Type", "application/x-www-form-urlencoded")
                .add("X-Device-ID", getDeviceId())
                .build()

            val request = Request.Builder()
                .url("https://$subdomain.$domain/api/token/login")
                .headers(headers)
                .post(payload.toRequestBody("application/x-www-form-urlencoded".toMediaTypeOrNull()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return@withContext null

            return@withContext JSONObject(response.body?.string() ?: "")
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }

    suspend fun getTestDeviceID() : String? = withContext(Dispatchers.IO) {
        return@withContext "BRAIAM 2 " + getDeviceId()
    }

}