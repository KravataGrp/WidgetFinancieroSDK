#import <UIKit/UIKit.h>

#import "AppDelegate.h"
#import "modules/CryptoModule.h"
#import "modules/SMSModule.h"

int main(int argc, char *argv[])
{
  @autoreleasepool {
    CryptoModule *moduleCrypto = [[CryptoModule alloc] init];
    SMSModule *moduleSMS =  [[SMSModule alloc] init];
    [moduleCrypto generateSHA256Hash];
    [moduleSMS registerSMSReceiver];
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
