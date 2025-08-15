#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TurboPreferences, NSObject)

RCT_EXTERN_METHOD(setName:(NSString *)name)
RCT_EXTERN_METHOD(get:(NSString *)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(set:(NSString *)key value:(NSString *)value)
RCT_EXTERN_METHOD(clear:(NSString *)key)
RCT_EXTERN_METHOD(clearAll)
RCT_EXTERN_METHOD(getAll:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setMultiple:(NSArray *)values)
RCT_EXTERN_METHOD(contains:(NSString *)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
