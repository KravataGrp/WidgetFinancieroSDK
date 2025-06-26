package com.widget.kravata_sdk_plugin.flutter

import android.content.Context
import io.flutter.plugin.common.StandardMessageCodec
import io.flutter.plugin.platform.PlatformView
import io.flutter.plugin.platform.PlatformViewFactory
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.BinaryMessenger


class KravataWebViewFactory(
    private val messenger: BinaryMessenger
) : PlatformViewFactory(StandardMessageCodec.INSTANCE) {

    override fun create(context: Context, id: Int, args: Any?): PlatformView {
        val params = args as? Map<String, Any>
        val countryCode = params?.get("countryCode") as? String ?: "+57"
        val phoneClient = params?.get("phoneClient") as? String ?: ""

        val channel = MethodChannel(messenger, "kravata_webview_channel_$id")

        return KravataWebView(context, channel, countryCode, phoneClient)
    }

}