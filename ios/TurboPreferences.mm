#import "TurboPreferences.h"
#import <React/RCTLog.h>

@implementation TurboPreferences

RCT_EXPORT_MODULE(TurboPreferences)

- (NSUserDefaults *)userDefaults {
    static NSUserDefaults *defaults = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        defaults = [NSUserDefaults standardUserDefaults];
    });
    return defaults;
}

- (NSUserDefaults *)userDefaultsWithSuite:(NSString *)suiteName {
    if (suiteName && suiteName.length > 0) {
        return [[NSUserDefaults alloc] initWithSuiteName:suiteName];
    }
    return [self userDefaults];
}

- (void)setName:(NSString *)name
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
    // This method is mainly for Android compatibility
    // On iOS, we'll store the suite name in a special key for reference
    if (name && name.length > 0) {
        [[self userDefaults] setObject:name forKey:@"__turbo_preferences_suite_name__"];
    } else {
        [[self userDefaults] removeObjectForKey:@"__turbo_preferences_suite_name__"];
    }
    [[self userDefaults] synchronize];
    resolve(@(YES));
}

- (void)get:(NSString *)key
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    NSString *value = [defaults stringForKey:key];
    resolve(value);
}

- (void)set:(NSString *)key
      value:(NSString *)value
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    if (value) {
        [defaults setObject:value forKey:key];
    } else {
        [defaults removeObjectForKey:key];
    }
    
    BOOL success = [defaults synchronize];
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"SYNC_FAILED", @"Failed to synchronize UserDefaults", nil);
    }
}

- (void)clear:(NSString *)key
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    [defaults removeObjectForKey:key];
    BOOL success = [defaults synchronize];
    
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"SYNC_FAILED", @"Failed to synchronize UserDefaults", nil);
    }
}

- (void)contains:(NSString *)key
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    BOOL contains = [defaults objectForKey:key] != nil;
    resolve(@(contains));
}

- (void)setBoolean:(NSString *)key
             value:(BOOL)value
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];

    [defaults setBool:value forKey:key];
    resolve(nil);
}

- (void)getBoolean:(NSString *)key
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];

    id value = [defaults objectForKey:key];
    if ([value isKindOfClass:[NSNumber class]]) {
        resolve(@([value boolValue]));
    } else {
        resolve(nil);
    }
}

- (void)setInt:(NSString *)key
         value:(NSInteger)value
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];

    [defaults setInteger:value forKey:key];
    resolve(nil);
}

- (void)getInt:(NSString *)key
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];

    id value = [defaults objectForKey:key];
    if ([value isKindOfClass:[NSNumber class]]) {
        resolve(@([value longLongValue]));
    } else {
        resolve(nil);
    }
}

- (void)setDouble:(NSString *)key
            value:(double)value
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];

    [defaults setDouble:value forKey:key];
    resolve(nil);
}

- (void)getDouble:(NSString *)key
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];

    id value = [defaults objectForKey:key];
    if ([value isKindOfClass:[NSNumber class]]) {
        resolve(@([value doubleValue]));
    } else {
        resolve(nil);
    }
}

- (void)setMultiple:(NSArray *)values
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    if (![values isKindOfClass:[NSArray class]]) {
        reject(@"INVALID_VALUES", @"Values must be an array", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    for (NSDictionary *item in values) {
        if ([item isKindOfClass:[NSDictionary class]]) {
            NSString *key = item[@"key"];
            NSString *value = item[@"value"];
            
            if (key && [key isKindOfClass:[NSString class]]) {
                if (value && [value isKindOfClass:[NSString class]]) {
                    [defaults setObject:value forKey:key];
                } else {
                    [defaults removeObjectForKey:key];
                }
            }
        }
    }
    
    BOOL success = [defaults synchronize];
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"SYNC_FAILED", @"Failed to synchronize UserDefaults", nil);
    }
}

- (void)getMultiple:(NSArray *)keys
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    if (![keys isKindOfClass:[NSArray class]]) {
        reject(@"INVALID_KEYS", @"Keys must be an array", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    
    for (NSString *key in keys) {
        if ([key isKindOfClass:[NSString class]]) {
            NSString *value = [defaults stringForKey:key];
            result[key] = value ?: [NSNull null];
        }
    }
    
    resolve(result);
}

- (void)clearMultiple:(NSArray *)keys
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
    if (![keys isKindOfClass:[NSArray class]]) {
        reject(@"INVALID_KEYS", @"Keys must be an array", nil);
        return;
    }
    
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    for (NSString *key in keys) {
        if ([key isKindOfClass:[NSString class]]) {
            [defaults removeObjectForKey:key];
        }
    }
    
    BOOL success = [defaults synchronize];
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"SYNC_FAILED", @"Failed to synchronize UserDefaults", nil);
    }
}

- (void)getAll:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    NSDictionary *allValues = [defaults dictionaryRepresentation];
    NSMutableDictionary *stringValues = [NSMutableDictionary dictionary];
    
    for (NSString *key in allValues) {
        id value = allValues[key];
        if ([value isKindOfClass:[NSString class]]) {
            // Skip our internal keys
            if (![key hasPrefix:@"__turbo_preferences_"]) {
                stringValues[key] = value;
            }
        }
    }
    
    resolve(stringValues);
}

- (void)clearAll:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
    NSString *suiteName = [[self userDefaults] objectForKey:@"__turbo_preferences_suite_name__"];
    NSUserDefaults *defaults = [self userDefaultsWithSuite:suiteName];
    
    // Get all keys and remove them (except our internal ones)
    NSDictionary *allValues = [defaults dictionaryRepresentation];
    for (NSString *key in allValues) {
        if (![key hasPrefix:@"__turbo_preferences_"]) {
            [defaults removeObjectForKey:key];
        }
    }
    
    BOOL success = [defaults synchronize];
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"SYNC_FAILED", @"Failed to synchronize UserDefaults", nil);
    }
}

- (void)reloadWidgets:(NSString *)kind
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
    Class widgetsClass = NSClassFromString(@"TurboPreferencesWidgets");
    if (!widgetsClass) {
        reject(@"E_WIDGETS_UNAVAILABLE", @"WidgetKit helper class not found", nil);
        return;
    }

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    if (kind && kind.length > 0) {
        [widgetsClass performSelector:@selector(reloadTimelinesOfKind:) withObject:kind];
    } else {
        [widgetsClass performSelector:@selector(reloadAllTimelines)];
    }
#pragma clang diagnostic pop

    resolve(nil);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeTurboPreferencesSpecJSI>(params);
}

@end
