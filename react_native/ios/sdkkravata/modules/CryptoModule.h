#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface CryptoModule: NSObject <RCTModule>

- (void)encryptData:(NSString *)dataCipher
           publicPem:(NSString *)publicPem
           privatePem:(NSString *)privatePem
               nonce:(NSString *)nonce
              macKey:(NSString *)macKey
             resolver:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject;

@end