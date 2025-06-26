#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <CoreTelephony/CTCallCenter.h>
#import "modules/SMSModule.h"


@implementation SMSModule

RCT_EXPORT_MODULE();

- (void)sendEvent:(NSString *)eventName message:(NSString *)message {
    RCTEventEmitter *eventEmitter = [self.bridge moduleForClass:[RCTEventEmitter class]];
    [eventEmitter sendEventWithName:eventName body:message];
}


- (void)registerSMSReceiver {
    MFMessageComposeViewController *messageComposeVC = [[MFMessageComposeViewController alloc] init];
    messageComposeVC.messageComposeDelegate = self;
    
    // Configura el número de teléfono y el mensaje
    [messageComposeVC setRecipients:@[@"1234567890"]];
    [messageComposeVC setBody:@"Hola, esto es un mensaje de prueba"];
    
    // Presenta el controlador
    [self presentViewController:messageComposeVC animated:YES completion:nil];
}

// Delegate para recibir respuestas de envío de mensajes
- (void)messageComposeViewController:(MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result {
    switch (result) {
        case MessageComposeResultCancelled:
            NSLog(@"Mensaje cancelado");
            break;
        case MessageComposeResultFailed:
            NSLog(@"Error al enviar mensaje");
            break;
        case MessageComposeResultSent:
            NSLog(@"Mensaje enviado");
            break;
        default:
            break;
    }
    
    // Cierra el controlador
    [self dismissViewControllerAnimated:YES completion:nil];
}

@end