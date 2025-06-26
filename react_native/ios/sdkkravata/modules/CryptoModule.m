#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <Security/Security.h>
#import <CommonCrypto/CommonCrypto.h>

#import "modules/CryptoModule.h"

@implementation CryptoModule

RCT_EXPORT_MODULE();

- (void)encryptData:(NSString *)dataCipher
           publicPem:(NSString *)publicPem
           privatePem:(NSString *)privatePem
               nonce:(NSString *)nonce
              macKey:(NSString *)macKey
             resolver:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject {
    @try {
        // Leer clave pública
        SecKeyRef publicKey = [self __readPublicKeyFromPEM:publicPem];

        // Leer clave privada
        SecKeyRef privateKey = [self __readPrivateKeyFromPEM:privatePem];

        // Intercambio de claves ECDH
        NSData *sharedKey = [self __doExchangeWithPublicKey:publicKey privateKey:privateKey];

        // Derivar clave HKDF
        NSData *derivedKey = [self __deriveHkdfWithSharedKey:sharedKey length:32];

        // Obtener timestamp
        NSUInteger timestamp = [[NSDate date] timeIntervalSince1970];

        // Cifrar datos
        NSData *cipherText = [self __encryptData:[dataCipher dataUsingEncoding:NSUTF8StringEncoding]
                                         clave:derivedKey
                                            iv:[nonce stringByAppendingString:[NSString stringWithFormat:@"%d", (int)(timestamp / 100)]]];

        // Calcular HMAC
        NSData *hmac = [self __hmacSha384:cipherText clave:[macKey stringByAppendingString:[NSString stringWithFormat:@"%lu", (unsigned long)timestamp]]];

        // Resolver promesa
        resolve([NSString stringWithFormat:@"%@:%@:%lu", [cipherText toHexString], [hmac toHexString], (unsigned long)timestamp]);
    } @catch (NSException *exception) {
        reject(@"Error", exception.reason, nil);
    }
}

- (SecKeyRef)__readPublicKeyFromPEM:(NSString *)pem {
    // Eliminar cabeceras y espacios en blanco del PEM
    NSString *cleanPem = [pem stringByReplacingOccurrencesOfString:@"-----BEGIN PUBLIC KEY-----" withString:@""];
    cleanPem = [cleanPem stringByReplacingOccurrencesOfString:@"-----END PUBLIC KEY-----" withString:@""];
    cleanPem = [cleanPem stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    cleanPem = [cleanPem stringByReplacingOccurrencesOfString:@"\\s+" withString:@""];

    // Convertir PEM a datos binarios
    NSData *publicKeyData = [[NSData alloc] initWithBase64EncodedString:cleanPem options:0];

    // Crear una clave pública a partir de los datos binarios
    SecKeyRef publicKey = SecKeyCreateFromData(kSecAttrKeyTypeECSECPrime192r1, (__bridge CFDataRef)publicKeyData, NULL);
    return publicKey;
}

- (SecKeyRef)__readPrivateKeyFromPEM:(NSString *)pem {
    // Eliminar cabeceras y espacios en blanco del PEM
    NSString *cleanPem = [pem stringByReplacingOccurrencesOfString:@"-----BEGIN PRIVATE KEY-----" withString:@""];
    cleanPem = [cleanPem stringByReplacingOccurrencesOfString:@"-----END PRIVATE KEY-----" withString:@""];
    cleanPem = [cleanPem stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    cleanPem = [cleanPem stringByReplacingOccurrencesOfString:@"\\s+" withString:@""];

    // Convertir PEM a datos binarios
    NSData *privateKeyData = [[NSData alloc] initWithBase64EncodedString:cleanPem options:0];

    // Crear una clave privada a partir de los datos binarios
    SecKeyRef privateKey = SecKeyCreateFromData(kSecAttrKeyTypeECSECPrime192r1, (__bridge CFDataRef)privateKeyData, NULL);
    return privateKey;
}

- (NSData *)__doExchangeWithPublicKey:(SecKeyRef)publicKey privateKey:(SecKeyRef)privateKey {
    // Crear un acuerdo de clave ECDH
    SecKeyRef keyAgreementRef = SecKeyCreateECDHKeyExchange(privateKey, publicKey);

    // Realizar el intercambio de clave
    CFErrorRef error;
    NSData *sharedSecret = SecKeyCopyKeyExchangeResult(keyAgreementRef, kSecKeyExchangeResultType.ECDSA, &error);

    // Verificar si hubo un error
    if (error) {
        NSLog(@"Error en el intercambio de clave: %@", error);
        return nil;
    }

    return sharedSecret;
}

- (SecKey)__deriveHkdfWithSharedKey:(NSData *)sharedKey length:(size_t)length {
    // Configuración de HKDF
    NSString *algorithm = @"SHA-384";
    NSData *salt = nil;
    NSData *info = nil;

    // Derivar la llave utilizando HKDF
    NSData *derivedKey = [sharedKey hkdf:algorithm
                                    salt:salt
                                    info:info
                               keyLength:length];

    // Crear una clave secreta a partir de la llave derivada
    SecKeyRef derivedKeyRef = SecKeyCreateFromData(kSecAttrKeyTypeHMAC, (__bridge CFDataRef)derivedKey, NULL);

    return derivedKeyRef;
}

//Si falla, buscar una libreria que haga esta misma tarea de generar el hkdf
- (NSData *)hkdf:(NSString *)algorithm
             salt:(NSData *)salt
             info:(NSData *)info
        keyLength:(size_t)length
{
    NSData *sharedKey = self;

    // Paso 1: Extract
    NSData *pseudoRandomKey = [self extract:algorithm salt:salt];

    // Paso 2: Expand
    NSData *derivedKey = [self expand:algorithm
                         pseudoRandomKey:pseudoRandomKey
                                info:info
                            keyLength:length];

    return derivedKey;
}

- (NSData *)extract:(NSString *)algorithm
               salt:(NSData *)salt
{
    NSData *sharedKey = self;
    NSData *saltData = salt ?: [NSData data]; // Si salt es nil, utiliza una cadena vacía

    NSMutableData *input = [NSMutableData dataWithData:saltData];
    [input appendData:sharedKey];

    NSData *hash = [self hash:algorithm data:input];
    return hash;
}

- (NSData *)expand:(NSString *)algorithm
     pseudoRandomKey:(NSData *)pseudoRandomKey
               info:(NSData *)info
           keyLength:(size_t)length
{
    NSMutableData *derivedKey = [NSMutableData data];
    NSData *infoData = info ?: [NSData data]; // Si info es nil, utiliza una cadena vacía

    size_t hashLength = [self hashLength:algorithm];
    size_t iterations = (length / hashLength) + (length % hashLength != 0 ? 1 : 0);

    for (NSUInteger i = 0; i < iterations; i++) {
        NSMutableData *input = [NSMutableData data];
        [input appendData:infoData];
        [input appendBytes:&i length:sizeof(i)];

        NSData *hash = [self hash:algorithm
                         key:pseudoRandomKey
                         data:input];

        [derivedKey appendData:hash];
    }

    // Recortar la clave derivada a la longitud deseada
    NSData *truncatedDerivedKey = [derivedKey subdataWithRange:NSMakeRange(0, length)];
    return truncatedDerivedKey;
}

- (NSData *)hash:(NSString *)algorithm
             key:(NSData *)key
             data:(NSData *)data
{
    NSData *hashedData = nil;

    if ([algorithm isEqualToString:@"SHA-384"]) {
        hashedData = [self sha384:key data:data];
    }

    return hashedData;
}

- (NSData *)sha384:(NSData *)key
               data:(NSData *)data
{
    NSData *hashedData = nil;

    // Utiliza la función CCHmac de CommonCrypto para calcular el HMAC-SHA-384
    uint8_t digest[CC_SHA384_DIGEST_LENGTH];
    CCHmac(kCCHmacAlgSHA384, key.bytes, key.length, data.bytes, data.length, digest);
    hashedData = [NSData dataWithBytes:digest length:CC_SHA384_DIGEST_LENGTH];

    return hashedData;
}

- (size_t)hashLength:(NSString *)algorithm
{
    size_t hashLength = 0;

    if ([algorithm isEqualToString:@"SHA-384"]) {
        hashLength = CC_SHA384_DIGEST_LENGTH;
    }

    return hashLength;
}

- (NSData *)__encryptData:(NSData *)data clave:(SecKeyRef)clave iv:(NSString *)iv {
    // Configuración del cifrador
    const CCCryptorAlgorithm algorithm = kCCAlgorithmAES128;
    const CCCryptorMode mode = kCCModeCTR;
    const CCOptions options = kCCOptionPKCS7Padding;

    // Conversión del IV a datos
    NSData *ivData = [iv dataUsingEncoding:NSUTF8StringEncoding];

    // Cifrado de los datos
    size_t bufferSize = [data length] + [ivData length];
    void *buffer = malloc(bufferSize);
    size_t numBytesEncrypted = 0;
    CCCryptorStatus status = CCCrypt(kCCEncrypt,
                                     algorithm,
                                     mode,
                                     [clave keyData].bytes,
                                     [clave keyData].length,
                                     [ivData bytes],
                                     [data bytes],
                                     [data length],
                                     buffer,
                                     bufferSize,
                                     &numBytesEncrypted);

    // Verificar si hubo un error
    if (status != kCCSuccess) {
        NSLog(@"Error en el cifrado: %d", status);
        free(buffer);
        return nil;
    }

    // Devolver los datos cifrados
    NSData *encryptedData = [NSData dataWithBytes:buffer length:numBytesEncrypted];
    free(buffer);
    return encryptedData;
}


- (NSData *)__hmacSha384:(NSData *)data clave:(NSString *)clave {
    // Conversión de la clave a datos
    NSData *claveData = [clave dataUsingEncoding:NSUTF8StringEncoding];

    // Creación del objeto HMAC
    CCHmacContext hmacContext;
    CCHmacInit(&hmacContext, kCCHmacAlgSHA384, claveData.bytes, claveData.length);

    // Actualización del objeto HMAC con los datos
    CCHmacUpdate(&hmacContext, data.bytes, data.length);

    // Finalización del objeto HMAC
    unsigned char hmacDigest[CC_SHA384_DIGEST_LENGTH];
    CCHmacFinal(&hmacContext, hmacDigest);

    // Devolver el resumen HMAC
    NSData *hmacDigestData = [NSData dataWithBytes:hmacDigest length:CC_SHA384_DIGEST_LENGTH];
    return hmacDigestData;
}

- (NSString *)toHexString:(NSData *)data {
    return [data base64EncodedStringWithOptions:0];
}


@end