import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'kravata_sdk_plugin_platform_interface.dart';

/// An implementation of [KravataSdkPluginPlatform] that uses method channels.
class MethodChannelKravataSdkPlugin extends KravataSdkPluginPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('kravata_sdk_plugin');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>(
      'getPlatformVersion',
    );
    return version;
  }

  @override
  Future<void> setParameters(Map<String, String> params) async {
    await methodChannel.invokeMethod("setParameters", params);
  }

  @override
  Future<String?> getTestDeviceID() async {
    return await methodChannel.invokeMethod("getTestDeviceID");
  }
}
