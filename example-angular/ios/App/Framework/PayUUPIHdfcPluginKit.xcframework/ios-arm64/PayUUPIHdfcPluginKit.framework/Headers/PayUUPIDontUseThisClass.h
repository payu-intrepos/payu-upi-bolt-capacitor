//
//  UpiHelper.h
//  PayUUPIHdfcPluginKit
//
//  Created by Amrendra Roy on 14/08/24.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface PayUUPIDontUseThisClass : NSObject

+ (NSString*)HMACWithSecret:(NSString*) secret andData:(NSString*)data;

+ (NSData *)encryptWithA256GCM:(NSData *)dataIn
                      ivString:(NSString *)iv
                           key:(NSData*)symmetricKey
                           aad:(NSData *)aad
                         error:(NSError **)error;

+ (NSString*)sha256:(NSString *)key;

+ (NSString*) sha256:(NSString *)key withRandom:(NSString *)random;

+ (NSString*)hmacSHA256:(NSString*)string withKey:(NSString *)key;

+ (NSString*)populateHMAC: (NSString*)hashSHA256
                    token: (NSString*)token
                   random: (NSString*)random;

+ (NSString*)populateTrust:(NSString*)trust
                     token:(NSString*)token
                        random:(NSString*)random;

+ (NSString *)generateRadom;

@end

NS_ASSUME_NONNULL_END
