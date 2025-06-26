import 'kravata_sdk_plugin_platform_interface.dart';

class KravataSdkPlugin {
  Future<String?> getPlatformVersion() {
    return KravataSdkPluginPlatform.instance.getPlatformVersion();
  }

  Future<void> setParameters(Map<String, String> params) {
    return KravataSdkPluginPlatform.instance.setParameters(params);
  }

  Future<String?> getTestDeviceID() {
    return KravataSdkPluginPlatform.instance.getTestDeviceID();
  }
}
