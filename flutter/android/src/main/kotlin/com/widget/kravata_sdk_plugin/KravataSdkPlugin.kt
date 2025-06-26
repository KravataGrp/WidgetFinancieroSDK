package com.widget.kravata_sdk_plugin

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import com.kravata.utils.components.KravataWebComponent
import com.widget.kravata_sdk_plugin.flutter.KravataWebViewFactory
import com.kravata.utils.services.ApiKravataService
import com.kravata.utils.services.SecurityStorageService
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.PluginRegistry.ActivityResultListener
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient



/** KravataSdkPlugin */
class KravataSdkPlugin : FlutterPlugin, MethodCallHandler, ActivityAware, ActivityResultListener {

  private lateinit var channel: MethodChannel
  private lateinit var context: Context

  private var activity: Activity? = null
  private var binding: ActivityPluginBinding? = null
  private var currentWebComponent: KravataWebComponent? = null
  private val SMS_CONSENT_REQUEST = 2025

  override fun onAttachedToActivity(binding: ActivityPluginBinding) {
    activity = binding.activity
    this.binding = binding
    binding.addActivityResultListener(this)
  }

  override fun onDetachedFromActivity() {
    binding?.removeActivityResultListener(this)
    activity = null
  }

  override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
    onAttachedToActivity(binding)
  }

  override fun onDetachedFromActivityForConfigChanges() {
    onDetachedFromActivity()
  }


  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
    if (requestCode == SMS_CONSENT_REQUEST && resultCode == Activity.RESULT_OK) {
      val message = data?.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
      val code = Regex("\\d{4,6}").find(message ?: "")?.value ?: return false
      currentWebComponent?.injectOtpCode(code)
      return true
    }
    return false
  }

  companion object {
    var pluginInstance: KravataSdkPlugin? = null
  }

  override fun onAttachedToEngine(flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
    pluginInstance = this
    context = flutterPluginBinding.applicationContext
    channel = MethodChannel(flutterPluginBinding.binaryMessenger, "kravata_sdk_plugin")
    channel.setMethodCallHandler(this)

    flutterPluginBinding
      .platformViewRegistry
      .registerViewFactory("kravata_webview", KravataWebViewFactory(flutterPluginBinding.binaryMessenger))
  }

  fun startOtpConsentFlow(component: KravataWebComponent) {
    currentWebComponent = component
    SmsRetriever.getClient(activity ?: return).startSmsUserConsent(null)

    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == SmsRetriever.SMS_RETRIEVED_ACTION) {
          val extras = intent.extras
          val status = extras?.get(SmsRetriever.EXTRA_STATUS) as? Status
          if (status?.statusCode == CommonStatusCodes.SUCCESS) {
            val consentIntent = extras.getParcelable<Intent>(SmsRetriever.EXTRA_CONSENT_INTENT)
            try {
              activity?.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST)
            } catch (e: Exception) {
              Log.e("KravataPlugin", "Error iniciando consentimiento", e)
            }
          }
        }
      }
    }

    activity?.registerReceiver(receiver, IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION))
  }


  override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
    val storage = SecurityStorageService(context)
    val client = OkHttpClient()

    val service = ApiKravataService(context, storage, client)

    when (call.method) {
      "setParameters" -> {
        val params = call.arguments as Map<String, String>
        CoroutineScope(Dispatchers.Main).launch {
          service.setParameters(params)
          result.success(null)
        }
      }
      "getTestDeviceID" -> {
        CoroutineScope(Dispatchers.Main).launch {
          val res = service.getTestDeviceID()
          result.success(res)
        }
      }
      else -> result.notImplemented()
    }
  }

  override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
    channel.setMethodCallHandler(null)
  }
}
