package com.kravata.utils.components

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import com.kravata.utils.services.ApiKravataService
import com.kravata.utils.services.SecurityStorageService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient

class KravataWebComponent(
    private val context: Context,
    private val countryCode: String,
    private val phoneClient: String,
    private val onLoaded: (() -> Unit)? = null
) {

    private val storage = SecurityStorageService(context)
    private val client = OkHttpClient()


    val webView: WebView = WebView(context)
    val apikravataService : ApiKravataService = ApiKravataService(context, storage, client)
    var url: String? = ""

    private val SMS_CONSENT_REQUEST = 2025
    private var smsReceiver: BroadcastReceiver? = null


    init {
        setupPreView()
    }

    private fun setupPreView() {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                url = apikravataService.getUrlWidget(phoneClient, countryCode)
                if (!url.isNullOrBlank()) {
                    setupWebView()
                }
            } catch (e: Exception) {
                Log.e("KravataWebComponent", "Error configurando vista", e)
            }
        }
    }

    fun startSmsListener(activity: Activity) {
        SmsRetriever.getClient(context).startSmsUserConsent(null)  // null = cualquier número

        smsReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (SmsRetriever.SMS_RETRIEVED_ACTION == intent.action) {
                    val extras = intent.extras
                    val status = extras?.get(SmsRetriever.EXTRA_STATUS) as? Status
                    when (status?.statusCode) {
                        CommonStatusCodes.SUCCESS -> {
                            val consentIntent = extras.getParcelable<Intent>(SmsRetriever.EXTRA_CONSENT_INTENT)
                            try {
                                activity.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST)
                            } catch (e: Exception) {
                                Log.e("KravataWebComponent", "No se pudo iniciar consentimiento de SMS", e)
                            }
                        }
                    }
                }
            }
        }

        context.registerReceiver(smsReceiver, IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION))
    }

    private fun setupWebView() {
        println("Inicio el setupWebView: $url")
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.addJavascriptInterface(JSBridge(), "KravataNative")
        WebView.setWebContentsDebuggingEnabled(true)
        webView.webViewClient = object : WebViewClient() {

            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                Log.d("WebViewRequest", "Intercepted: ${request?.url}")
                return super.shouldInterceptRequest(view, request)
            }

            override fun onReceivedHttpError(
                view: WebView,
                request: WebResourceRequest,
                errorResponse: WebResourceResponse
            ) {
                Log.e("WebViewHttpError", "Error en ${request.url} - code: ${errorResponse.statusCode}")

                // Leer contenido si es un JSON
                if (errorResponse.mimeType?.contains("json") == true) {
                    try {
                        val json = errorResponse.data.bufferedReader().use { it.readText() }
                        Log.e("WebViewHttpError", "Response body: $json")
                    } catch (e: Exception) {
                        Log.e("WebViewHttpError", "No se pudo leer el body del error", e)
                    }
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                injectTokens()
                onLoaded?.invoke()
            }
        }
        if(!url.isNullOrBlank()){
            webView.loadUrl(url!!)
        }
    }

    fun injectTokens() {
        val deviceId = apikravataService.getDeviceId()
        val js = """
            setTimeout(() => {
              localStorage.setItem("kra_accessToken", "ACCESS_TOKEN");
              localStorage.setItem("kra_refreshToken", "REFRESH_TOKEN");
              localStorage.setItem("kra_expireDate", "${System.currentTimeMillis() + 3600000}");
              localStorage.setItem("X-Device-ID", "$deviceId");
              window.KravataNative.onDataReady("Inyectado");
            }, 1000);
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    inner class JSBridge {
        @JavascriptInterface
        fun onDataReady(msg: String) {
            Log.d("KravataWebComponent", "Mensaje desde JS: $msg")
            // Aquí puedes emitir eventos o guardar en variable
        }
    }

    fun injectOtpCode(otpCode: String) {
        val jsCode = """
        (function() {
            if(document.getElementById("number1")) {
                document.getElementById("number1").value = "${otpCode.getOrNull(0) ?: ""}";
                document.getElementById("number2").value = "${otpCode.getOrNull(1) ?: ""}";
                document.getElementById("number3").value = "${otpCode.getOrNull(2) ?: ""}";
                document.getElementById("number3").value = "${otpCode.getOrNull(2) ?: ""}";
                document.getElementById("number4").value = "${otpCode.getOrNull(3) ?: ""}";
                document.getElementById("number5").value = "${otpCode.getOrNull(4) ?: ""}";
                document.getElementById("number6").value = "${otpCode.getOrNull(5) ?: ""}";
                document.getElementById("number6").dispatchEvent(new Event("keyup"));
            }
        })();
    """.trimIndent()
        webView.post {
            webView.evaluateJavascript(jsCode, null)
        }
    }

    fun cleanup() {
        smsReceiver?.let {
            context.unregisterReceiver(it)
            smsReceiver = null
        }
    }


}
