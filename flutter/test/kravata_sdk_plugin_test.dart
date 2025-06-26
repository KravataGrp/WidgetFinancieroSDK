import 'package:flutter_test/flutter_test.dart';
import 'package:kravata_sdk_plugin/kravata_sdk_plugin.dart';
import 'package:kravata_sdk_plugin/kravata_sdk_plugin_platform_interface.dart';
import 'package:kravata_sdk_plugin/kravata_sdk_plugin_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockKravataSdkPluginPlatform
    with MockPlatformInterfaceMixin
    implements KravataSdkPluginPlatform {

  @override
  Future<String?> getPlatformVersion() => Future.value('42');
}

void main() {
  final KravataSdkPluginPlatform initialPlatform = KravataSdkPluginPlatform.instance;

  test('$MethodChannelKravataSdkPlugin is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelKravataSdkPlugin>());
  });

  test('getPlatformVersion', () async {
    KravataSdkPlugin kravataSdkPlugin = KravataSdkPlugin();
    MockKravataSdkPluginPlatform fakePlatform = MockKravataSdkPluginPlatform();
    KravataSdkPluginPlatform.instance = fakePlatform;

    expect(await kravataSdkPlugin.getPlatformVersion(), '42');
  });
}
