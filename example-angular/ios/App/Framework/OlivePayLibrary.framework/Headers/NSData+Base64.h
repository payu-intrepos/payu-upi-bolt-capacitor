//
//  NSData+Base64.m
//  TestApp
//
//  Created by Aman Gangurde on 10/11/22.
//

#import <Foundation/Foundation.h>

@class NSString;

@interface NSData (Base64Additions)

+ (NSData *)base64DataFromString:(NSString *)string;

@end
