import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class KravataWebView extends StatefulWidget {
  final String countryCode;
  final String phoneClient;

  const KravataWebView({
    super.key,
    required this.countryCode,
    required this.phoneClient,
  });

  @override
  State<KravataWebView> createState() => _KravataWebViewState();
}

class _KravataWebViewState extends State<KravataWebView> {
  bool _isLoading = true;
  static const MethodChannel _channel = MethodChannel(
    'kravata_webview_channel_0',
  );

  @override
  void initState() {
    super.initState();

    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onPageLoaded') {
        setState(() {
          _isLoading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        AndroidView(
          viewType: 'kravata_webview',
          creationParams: {
            'countryCode': widget.countryCode,
            'phoneClient': widget.phoneClient,
          },
          creationParamsCodec: const StandardMessageCodec(),
        ),
        if (_isLoading) const Center(child: CircularProgressIndicator()),
      ],
    );
  }
}
