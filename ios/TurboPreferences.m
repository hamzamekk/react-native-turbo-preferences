#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TurboPreferences, NSObject)

RCT_EXTERN_METHOD(multiply:(double)a b:(double)b resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setName:(NSString *)name)
RCT_EXTERN_METHOD(get:(NSString *)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(set:(NSString *)key value:(NSString *)value)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end