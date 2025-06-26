#import <React/RCTBridgeModule.h>

@interface SmsModule : NSObject <RCTModule>

- (void)sendEvent:(NSString *)eventName message:(NSString *)message;
- (void)registerSMSReceiver;

@end