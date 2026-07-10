#import "TurboPreferences.h"
#import <React/RCTLog.h>

@implementation TurboPreferences {
  NSMutableDictionary<NSString *, NSUserDefaults *> *_defaultsCache;
  // Per-store snapshots for change detection, keyed by store token
  // (@"" for the default store)
  NSMutableDictionary<NSString *, NSDictionary *> *_snapshots;
  BOOL _observing;
}

RCT_EXPORT_MODULE(TurboPreferences)

- (instancetype)init
{
    if (self = [super init]) {
        _defaultsCache = [NSMutableDictionary dictionary];
        _snapshots = [NSMutableDictionary dictionary];
    }
    return self;
}

- (void)dealloc
{
    if (_observing) {
        [[NSNotificationCenter defaultCenter] removeObserver:self];
    }
}

#pragma mark - Store access

- (NSString *)tokenForName:(NSString *)name
{
    return (name && name.length > 0) ? name : @"";
}

- (NSString *)domainForToken:(NSString *)token
{
    return token.length > 0 ? token : [[NSBundle mainBundle] bundleIdentifier];
}

- (NSUserDefaults *)defaultsForName:(NSString *)name
{
    NSString *token = [self tokenForName:name];

    @synchronized (self) {
        NSUserDefaults *defaults = _defaultsCache[token];
        if (!defaults) {
            defaults = token.length > 0
                ? [[NSUserDefaults alloc] initWithSuiteName:token]
                : [NSUserDefaults standardUserDefaults];
            _defaultsCache[token] = defaults;
            // Start change-watching this store from its current state
            if (_observing && !_snapshots[token]) {
                _snapshots[token] = [self snapshotForToken:token] ?: @{};
            }
        }
        return defaults;
    }
}

#pragma mark - Change events

- (NSDictionary *)snapshotForToken:(NSString *)token
{
    NSUserDefaults *defaults = _defaultsCache[token]
        ?: (token.length > 0 ? [[NSUserDefaults alloc] initWithSuiteName:token]
                             : [NSUserDefaults standardUserDefaults]);
    return [defaults persistentDomainForName:[self domainForToken:token]] ?: @{};
}

// The generated emit helpers call into a std::function that is only wired up
// here, so change observation must not start any earlier.
- (void)setEventEmitterCallback:(EventEmitterCallbackWrapper *)eventEmitterCallbackWrapper
{
    [super setEventEmitterCallback:eventEmitterCallbackWrapper];
    if (!_observing) {
        _observing = YES;
        @synchronized (self) {
            for (NSString *token in _defaultsCache) {
                _snapshots[token] = [self snapshotForToken:token] ?: @{};
            }
        }
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(userDefaultsDidChange:)
                                                     name:NSUserDefaultsDidChangeNotification
                                                   object:nil];
    }
}

- (void)userDefaultsDidChange:(NSNotification *)notification
{
    @synchronized (self) {
        for (NSString *token in _snapshots.allKeys) {
            NSDictionary *oldSnapshot = _snapshots[token] ?: @{};
            NSDictionary *newSnapshot = [self snapshotForToken:token];
            _snapshots[token] = newSnapshot;

            NSMutableSet *keys = [NSMutableSet setWithArray:oldSnapshot.allKeys];
            [keys addObjectsFromArray:newSnapshot.allKeys];

            id storeValue = token.length > 0 ? token : [NSNull null];
            for (NSString *key in keys) {
                id oldValue = oldSnapshot[key];
                id newValue = newSnapshot[key];
                if (oldValue == newValue || [oldValue isEqual:newValue]) {
                    continue;
                }
                [self emitOnPreferenceChange:@{ @"key": key, @"store": storeValue }];
            }
        }
    }
}

#pragma mark - Single key ops

- (void)get:(NSString *)name
        key:(NSString *)key
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSString *value = [[self defaultsForName:name] stringForKey:key];
    resolve(value);
}

- (void)set:(NSString *)name
        key:(NSString *)key
      value:(NSString *)value
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    NSUserDefaults *defaults = [self defaultsForName:name];
    if (value) {
        [defaults setObject:value forKey:key];
    } else {
        [defaults removeObjectForKey:key];
    }
    resolve(nil);
}

- (void)clear:(NSString *)name
          key:(NSString *)key
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    [[self defaultsForName:name] removeObjectForKey:key];
    resolve(nil);
}

- (void)contains:(NSString *)name
             key:(NSString *)key
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    BOOL contains = [[self defaultsForName:name] objectForKey:key] != nil;
    resolve(@(contains));
}

#pragma mark - Typed ops

- (void)setBoolean:(NSString *)name
               key:(NSString *)key
             value:(BOOL)value
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    [[self defaultsForName:name] setBool:value forKey:key];
    resolve(nil);
}

- (void)getBoolean:(NSString *)name
               key:(NSString *)key
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    id value = [[self defaultsForName:name] objectForKey:key];
    if ([value isKindOfClass:[NSNumber class]]) {
        resolve(@([value boolValue]));
    } else {
        resolve(nil);
    }
}

- (void)setInt:(NSString *)name
           key:(NSString *)key
         value:(NSInteger)value
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    [[self defaultsForName:name] setInteger:value forKey:key];
    resolve(nil);
}

- (void)getInt:(NSString *)name
           key:(NSString *)key
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    id value = [[self defaultsForName:name] objectForKey:key];
    if ([value isKindOfClass:[NSNumber class]]) {
        resolve(@([value longLongValue]));
    } else {
        resolve(nil);
    }
}

- (void)setDouble:(NSString *)name
              key:(NSString *)key
            value:(double)value
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    [[self defaultsForName:name] setDouble:value forKey:key];
    resolve(nil);
}

- (void)getDouble:(NSString *)name
              key:(NSString *)key
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    if (!key || key.length == 0) {
        reject(@"INVALID_KEY", @"Key cannot be null or empty", nil);
        return;
    }

    id value = [[self defaultsForName:name] objectForKey:key];
    if ([value isKindOfClass:[NSNumber class]]) {
        resolve(@([value doubleValue]));
    } else {
        resolve(nil);
    }
}

#pragma mark - Batch ops

- (void)setMultiple:(NSString *)name
             values:(NSArray *)values
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    if (![values isKindOfClass:[NSArray class]]) {
        reject(@"INVALID_VALUES", @"Values must be an array", nil);
        return;
    }

    NSUserDefaults *defaults = [self defaultsForName:name];
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
    resolve(nil);
}

- (void)getMultiple:(NSString *)name
               keys:(NSArray *)keys
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    if (![keys isKindOfClass:[NSArray class]]) {
        reject(@"INVALID_KEYS", @"Keys must be an array", nil);
        return;
    }

    NSUserDefaults *defaults = [self defaultsForName:name];
    NSMutableDictionary *result = [NSMutableDictionary dictionary];

    for (NSString *key in keys) {
        if ([key isKindOfClass:[NSString class]]) {
            NSString *value = [defaults stringForKey:key];
            result[key] = value ?: [NSNull null];
        }
    }

    resolve(result);
}

- (void)clearMultiple:(NSString *)name
                 keys:(NSArray *)keys
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
    if (![keys isKindOfClass:[NSArray class]]) {
        reject(@"INVALID_KEYS", @"Keys must be an array", nil);
        return;
    }

    NSUserDefaults *defaults = [self defaultsForName:name];
    for (NSString *key in keys) {
        if ([key isKindOfClass:[NSString class]]) {
            [defaults removeObjectForKey:key];
        }
    }
    resolve(nil);
}

#pragma mark - Whole-store ops

- (void)getAll:(NSString *)name
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
    // The store's persistent domain only — unlike dictionaryRepresentation,
    // this excludes NSGlobalDomain (AppleLanguages and friends)
    [self defaultsForName:name]; // ensure the store is cached/watched
    NSDictionary *allValues = [self snapshotForToken:[self tokenForName:name]];
    NSMutableDictionary *stringValues = [NSMutableDictionary dictionary];

    for (NSString *key in allValues) {
        id value = allValues[key];
        if ([value isKindOfClass:[NSString class]]) {
            stringValues[key] = value;
        } else if ([value isKindOfClass:[NSNumber class]]) {
            // Typed values come back stringified, matching Android's getAll
            stringValues[key] = [value stringValue];
        }
    }

    resolve(stringValues);
}

- (void)clearAll:(NSString *)name
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
    NSUserDefaults *defaults = [self defaultsForName:name];
    [defaults removePersistentDomainForName:[self domainForToken:[self tokenForName:name]]];
    resolve(nil);
}

#pragma mark - Widgets

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
