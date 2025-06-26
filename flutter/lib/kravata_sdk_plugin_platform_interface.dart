import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'kravata_sdk_plugin_method_channel.dart';

abstract class KravataSdkPluginPlatform extends PlatformInterface {
  /// Constructs a KravataSdkPluginPlatform.
  KravataSdkPluginPlatform() : super(token: _token);

  static final Object _token = Object();

  static KravataSdkPluginPlatform _instance = MethodChannelKravataSdkPlugin();

  /// The default instance of [KravataSdkPluginPlatform] to use.
  ///
  /// Defaults to [MethodChannelKravataSdkPlugin].
  static KravataSdkPluginPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [KravataSdkPluginPlatform] when
  /// they register themselves.
  static set instance(KravataSdkPluginPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }

  Future<void> setParameters(Map<String, String> params) async {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }

  Future<String?> getTestDeviceID() async {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }
}
