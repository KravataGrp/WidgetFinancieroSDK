package com.widget.kravata_sdk_plugin.flutter

import android.content.Context
import android.view.View
import com.kravata.utils.components.KravataWebComponent
import com.widget.kravata_sdk_plugin.KravataSdkPlugin
import io.flutter.plugin.platform.PlatformView
import io.flutter.plugin.common.MethodChannel


class KravataWebView(
    private val context: Context,
    private val methodChannel: MethodChannel,
    countryCode: String,
    phoneClient: String
) : PlatformView {

    private val component = KravataWebComponent(
        context,
        countryCode,
        phoneClient,
        onLoaded = {
            methodChannel.invokeMethod("onPageLoaded", null)
        }
    )

    init {
        KravataSdkPlugin.pluginInstance?.startOtpConsentFlow(component)
    }


    override fun getView(): View = component.webView

    override fun dispose() {
        component.webView.destroy()
    }


}
