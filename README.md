# React Native Turbo Preferences

[![npm version](https://badge.fury.io/js/react-native-turbo-preferences.svg)](https://badge.fury.io/js/react-native-turbo-preferences)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/hamzamekk/react-native-turbo-preferences/workflows/CI/badge.svg)](https://github.com/hamzamekk/react-native-turbo-preferences/actions)
[![React Native](https://img.shields.io/badge/React%20Native-0.75+-blue.svg)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

> ⚡ Share preferences between your React Native app and **iOS widgets, watch apps, and app extensions** — App Groups (`NSUserDefaults`) on iOS, `SharedPreferences` on Android. Built as a TurboModule for React Native's New Architecture.

Your React Native JS code can't be seen by a WidgetKit widget, a watchOS app, or a share extension — the only bridge between them is a shared native store. This library gives you direct, typed access to that store: `UserDefaults(suiteName:)` App Group containers on iOS and named `SharedPreferences` files on Android.

It's also a great fit whenever native code (SDKs, Settings.bundle, Android home-screen widgets) needs to read values your JS writes — or plain fast key-value storage for app preferences.

## 🌟 Features

- 📲 **App Group Sharing** — Write from JS, read from your iOS widget, watch app, or extension
- 🚀 **New Architecture Native** — A true TurboModule, not an old bridge module running through interop
- 🪝 **React Hooks** — Convenient hooks for reactive state management
- 📱 **Cross-Platform** — Same JS API for iOS + Android with native optimizations
- 📦 **Lightweight** — Wraps native APIs (NSUserDefaults, SharedPreferences) directly, no custom storage format
- 🗂 **Namespace Support** — Switch between the default store and any named suite/file
- 🛠 **Batch Operations** — Set/get/remove multiple keys at once for efficiency
- 🧹 **Full Control** — Get all keys, clear store, check existence
- 🔒 **Type Safe** — Written in TypeScript with full type definitions

## 🤔 Why this library?

The two libraries most apps use for App Group / native preference sharing haven't shipped a release in years:

|                       | react-native-turbo-preferences        | [react-native-shared-group-preferences](https://www.npmjs.com/package/react-native-shared-group-preferences) | [react-native-default-preference](https://www.npmjs.com/package/react-native-default-preference) |
| --------------------- | -------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| Actively maintained   | ✅                                      | ❌ Last release Sept 2023                        | ❌ Last release June 2022                     |
| New Architecture      | ✅ Native TurboModule                   | ⚠️ Old bridge (via interop layer)                | ⚠️ Old bridge (via interop layer)             |
| iOS App Groups        | ✅ `UserDefaults(suiteName:)`           | ✅                                               | ✅                                            |
| Android backend       | ✅ `SharedPreferences` (app-sandboxed)  | ⚠️ Public external-storage JSON file, needs storage permissions, readable by other apps | ✅ `SharedPreferences` |
| Expo                  | ✅ Dev builds / EAS ([guide below](#-sharing-data-with-an-ios-widget-app-groups)) | ❌ "Doesn't work for Expo" (their README)        | ⚠️ Undocumented                               |
| React hooks           | ✅                                      | ❌                                               | ❌                                            |
| Batch operations      | ✅                                      | ❌                                               | ✅                                            |
| TypeScript            | ✅ Written in TS                        | ❌                                               | ⚠️ Type definitions only                      |

## 📦 Installation

### NPM

```bash
npm install react-native-turbo-preferences
```

### Yarn

```bash
yarn add react-native-turbo-preferences
```

### Additional Setup

**For React Native (Bare):**

```bash
npx pod-install
```

**For Expo:**
This package works with EAS builds.

## 🚀 Quick Start

### Imperative API

```typescript
import Prefs from 'react-native-turbo-preferences';

// Basic usage
await Prefs.set('username', 'Hamza');
const username = await Prefs.get('username');
console.log(username); // "Hamza"

// Use a named store
await Prefs.setName('MyPrefs');
await Prefs.set('theme', 'dark');
```

### React Hooks API

```typescript
import { usePreferenceString, usePreferenceNamespace } from 'react-native-turbo-preferences';

function UserProfile() {
  const [username, setUsername, hasUsername, clearUsername] = usePreferenceString('username');
  const [namespace, setNamespace, resetToDefault] = usePreferenceNamespace();

  return (
    <View>
      <Text>Username: {username || 'Not set'}</Text>
      <Button
        title="Set Username"
        onPress={() => setUsername('Hamza')}
      />
      <Button
        title="Clear Username"
        onPress={clearUsername}
      />
    </View>
  );
}
```

## 📲 Sharing data with an iOS Widget (App Groups)

This is the flagship use case: your React Native app writes a value, and your WidgetKit widget (or watch app / share extension / App Clip) reads it natively. Both sides just need to point at the same **App Group**.

### 1. Enable the App Group

**Bare React Native:** in Xcode, select your app target → _Signing & Capabilities_ → _+ Capability_ → **App Groups** → add a group like `group.com.yourcompany.yourapp`. Repeat for your widget/extension target with the **same** group id.

**Expo:** add the entitlement in `app.json` — no config plugin needed, `expo prebuild` / EAS Build picks it up:

```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.security.application-groups": ["group.com.yourcompany.yourapp"]
      }
    }
  }
}
```

> To create the widget extension target itself in an Expo project, use a target plugin such as [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets), and give the widget target the same App Group entitlement.

### 2. Write from React Native

```typescript
import Prefs from 'react-native-turbo-preferences';

await Prefs.setName('group.com.yourcompany.yourapp'); // switch to the App Group container
await Prefs.set('streak', '42');
await Prefs.set('lastWorkout', 'Push day');
```

### 3. Read from your widget (Swift)

```swift
struct Provider: TimelineProvider {
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    let defaults = UserDefaults(suiteName: "group.com.yourcompany.yourapp")
    let streak = defaults?.string(forKey: "streak") ?? "0"
    let workout = defaults?.string(forKey: "lastWorkout") ?? "—"
    // build your timeline entry from these values …
  }
}
```

> **Note:** all values are stored as strings — read them with `string(forKey:)` and parse as needed. iOS decides when widget timelines refresh; to force an immediate refresh after writing, call `WidgetCenter.shared.reloadAllTimelines()` from native code (a JS-callable `reloadWidgets()` is on the [roadmap](#-roadmap)).

### Android: sharing with native code

On Android, `setName('my_file')` maps to `getSharedPreferences("my_file", MODE_PRIVATE)` — the same file any native code in **your own app** (a Glance/home-screen widget, a headless service, an SDK) can read:

```kotlin
val prefs = context.getSharedPreferences("my_file", Context.MODE_PRIVATE)
val streak = prefs.getString("streak", "0")
```

Data stays inside your app's sandbox. (Unlike libraries that write a world-readable JSON file to external storage, other apps can't read, edit, or delete it — and no storage permissions are required.)

## 📖 API Documentation

### Basic Methods

#### `setName(name?: string | null): Promise<void>`

Switches the storage namespace.

**Parameters:**

- `name` (string, optional) - Namespace name. Pass null/undefined to reset to default store.

**Returns:** `Promise<void>`

**Example:**

```typescript
// iOS: uses UserDefaults(suiteName:)
// Android: uses getSharedPreferences(name, MODE_PRIVATE)
await Prefs.setName('group.com.your.app');
```

#### `get(key: string): Promise<string | null>`

Retrieves a value for a key.

**Parameters:**

- `key` (string) - The key to retrieve

**Returns:** `Promise<string | null>` - The value or null if missing

**Example:**

```typescript
const value = await Prefs.get('username');
if (value) {
  console.log('Username:', value);
}
```

#### `set(key: string, value: string): Promise<void>`

Stores a string value.

**Parameters:**

- `key` (string) - The key to store
- `value` (string) - The value to store

**Returns:** `Promise<void>`

**Example:**

```typescript
await Prefs.set('theme', 'dark');
await Prefs.set('lastLogin', new Date().toISOString());
```

#### `clear(key: string): Promise<void>`

Deletes a key.

**Parameters:**

- `key` (string) - The key to delete

**Returns:** `Promise<void>`

**Example:**

```typescript
await Prefs.clear('temporaryData');
```

#### `contains(key: string): Promise<boolean>`

Checks if a key exists.

**Parameters:**

- `key` (string) - The key to check

**Returns:** `Promise<boolean>` - True if key exists, false otherwise

**Example:**

```typescript
const hasTheme = await Prefs.contains('theme');
if (hasTheme) {
  console.log('Theme is configured');
}
```

### Batch Operations

#### `setMultiple(values: { key: string; value: string }[]): Promise<void>`

Sets multiple keys at once.

**Parameters:**

- `values` (array) - Array of objects with `key` and `value` properties

**Returns:** `Promise<void>`

**Example:**

```typescript
await Prefs.setMultiple([
  { key: 'theme', value: 'dark' },
  { key: 'lang', value: 'en' },
  { key: 'notifications', value: 'true' },
]);
```

#### `getMultiple(keys: string[]): Promise<{ [key: string]: string | null }>`

Retrieves multiple keys at once.

**Parameters:**

- `keys` (string[]) - Array of keys to retrieve

**Returns:** `Promise<{ [key: string]: string | null }>` - Object with key-value pairs

**Example:**

```typescript
const values = await Prefs.getMultiple(['theme', 'lang', 'notifications']);
console.log(values);
// { theme: 'dark', lang: 'en', notifications: 'true' }
```

#### `clearMultiple(keys: string[]): Promise<void>`

Removes multiple keys at once.

**Parameters:**

- `keys` (string[]) - Array of keys to remove

**Returns:** `Promise<void>`

**Example:**

```typescript
await Prefs.clearMultiple(['temp1', 'temp2', 'temp3']);
```

### Store Operations

#### `getAll(): Promise<{ [key: string]: string }>`

Returns all keys/values in the current store.

**Returns:** `Promise<{ [key: string]: string }>` - Object with all key-value pairs

**Example:**

```typescript
const allPrefs = await Prefs.getAll();
console.log('All preferences:', allPrefs);
```

#### `clearAll(): Promise<void>`

Clears the current store.

**Returns:** `Promise<void>`

**Example:**

```typescript
await Prefs.clearAll(); // ⚠️ Use with caution!
```

## 🪝 React Hooks API

The library provides convenient React hooks for reactive state management with automatic updates and type safety.

### `usePreferenceString(key: string)`

Hook for managing string preferences with reactive updates.

**Parameters:**

- `key` (string) - The preference key

**Returns:** `[value, setValue, contains, clear]`

- `value` (string | null) - Current value
- `setValue` (function) - `(value: string) => Promise<void>`
- `contains` (boolean) - Whether the key exists
- `clear` (function) - `() => Promise<void>`

**Example:**

```typescript
import { usePreferenceString } from 'react-native-turbo-preferences';

function UserSettings() {
  const [username, setUsername, hasUsername, clearUsername] = usePreferenceString('username');

  return (
    <View>
      <Text>Username: {username || 'Not set'}</Text>
      <Text>Has username: {hasUsername ? 'Yes' : 'No'}</Text>
      <Button title="Set" onPress={() => setUsername('John')} />
      <Button title="Clear" onPress={clearUsername} />
    </View>
  );
}
```

### `usePreferenceNumber(key: string)`

Hook for managing numeric preferences with automatic type conversion.

**Parameters:**

- `key` (string) - The preference key

**Returns:** `[value, setValue, contains, clear]`

- `value` (number | null) - Current numeric value
- `setValue` (function) - `(value: number) => Promise<void>`
- `contains` (boolean) - Whether the key exists
- `clear` (function) - `() => Promise<void>`

**Example:**

```typescript
import { usePreferenceNumber } from 'react-native-turbo-preferences';

function CounterSettings() {
  const [count, setCount, hasCount, clearCount] = usePreferenceNumber('count');

  return (
    <View>
      <Text>Count: {count ?? 0}</Text>
      <Button title="Increment" onPress={() => setCount((count ?? 0) + 1)} />
      <Button title="Reset" onPress={clearCount} />
    </View>
  );
}
```

### `usePreferenceBoolean(key: string)`

Hook for managing boolean preferences with automatic type conversion.

**Parameters:**

- `key` (string) - The preference key

**Returns:** `[value, setValue, contains, clear]`

- `value` (boolean | null) - Current boolean value
- `setValue` (function) - `(value: boolean) => Promise<void>`
- `contains` (boolean) - Whether the key exists
- `clear` (function) - `() => Promise<void>`

**Example:**

```typescript
import { usePreferenceBoolean } from 'react-native-turbo-preferences';

function NotificationSettings() {
  const [notifications, setNotifications, hasNotifications, clearNotifications] =
    usePreferenceBoolean('notifications');

  return (
    <View>
      <Text>Notifications: {notifications ? 'Enabled' : 'Disabled'}</Text>
      <Switch
        value={notifications ?? false}
        onValueChange={setNotifications}
      />
      <Button title="Reset" onPress={clearNotifications} />
    </View>
  );
}
```

### `usePreferenceObject<T>(key: string)`

Hook for managing object preferences with automatic JSON serialization.

**Parameters:**

- `key` (string) - The preference key
- `T` (generic) - TypeScript type for the object

**Returns:** `[value, setValue, contains, clear]`

- `value` (T | null) - Current object value
- `setValue` (function) - `(value: T) => Promise<void>`
- `contains` (boolean) - Whether the key exists
- `clear` (function) - `() => Promise<void>`

**Example:**

```typescript
import { usePreferenceObject } from 'react-native-turbo-preferences';

interface UserProfile {
  name: string;
  age: number;
  email: string;
}

function ProfileSettings() {
  const [profile, setProfile, hasProfile, clearProfile] =
    usePreferenceObject<UserProfile>('userProfile');

  const updateProfile = () => {
    setProfile({
      name: 'John Doe',
      age: 30,
      email: 'john@example.com'
    });
  };

  return (
    <View>
      <Text>Name: {profile?.name || 'Not set'}</Text>
      <Text>Age: {profile?.age || 'Not set'}</Text>
      <Text>Email: {profile?.email || 'Not set'}</Text>
      <Button title="Update Profile" onPress={updateProfile} />
      <Button title="Clear Profile" onPress={clearProfile} />
    </View>
  );
}
```

### `usePreferenceNamespace()`

Hook for managing preference namespaces with reactive updates.

**Returns:** `[currentNamespace, setNamespace, resetToDefault]`

- `currentNamespace` (string) - Current namespace name
- `setNamespace` (function) - `(namespace: string) => Promise<void>`
- `resetToDefault` (function) - `() => Promise<void>`

**Example:**

```typescript
import { usePreferenceNamespace } from 'react-native-turbo-preferences';

function NamespaceManager() {
  const [namespace, setNamespace, resetToDefault] = usePreferenceNamespace();

  return (
    <View>
      <Text>Current namespace: {namespace || 'Default'}</Text>
      <Button title="User Settings" onPress={() => setNamespace('user_settings')} />
      <Button title="App Config" onPress={() => setNamespace('app_config')} />
      <Button title="Reset to Default" onPress={resetToDefault} />
    </View>
  );
}
```

### Hook Features

- **🔄 Reactive Updates** - Values automatically update when changed
- **⚡ Automatic Loading** - Initial values loaded on mount
- **🎯 Type Safety** - Full TypeScript support with proper types
- **🛡️ Error Handling** - Built-in error handling with console warnings
- **🔧 Simple API** - Consistent `[value, setValue, contains, clear]` pattern

## 🎯 Usage Examples

### Example 1: React Hooks in Practice

```typescript
import React from 'react';
import { View, Text, Switch, Button, TextInput } from 'react-native';
import {
  usePreferenceString,
  usePreferenceBoolean,
  usePreferenceObject,
  usePreferenceNamespace
} from 'react-native-turbo-preferences';

interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  language: string;
}

function SettingsScreen() {
  // Namespace management
  const [namespace, setNamespace, resetToDefault] = usePreferenceNamespace();

  // Basic preferences
  const [username, setUsername, hasUsername, clearUsername] = usePreferenceString('username');
  const [notifications, setNotifications, , clearNotifications] = usePreferenceBoolean('notifications');

  // Complex object preferences
  const [settings, setSettings, hasSettings, clearSettings] =
    usePreferenceObject<UserSettings>('userSettings');

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Namespace Control */}
      <Text>Current namespace: {namespace || 'Default'}</Text>
      <Button title="User Prefs" onPress={() => setNamespace('user')} />
      <Button title="App Prefs" onPress={() => setNamespace('app')} />
      <Button title="Reset Namespace" onPress={resetToDefault} />

      {/* String Preference */}
      <Text>Username: {username || 'Not set'}</Text>
      <TextInput
        value={username || ''}
        onChangeText={setUsername}
        placeholder="Enter username"
      />

      {/* Boolean Preference */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Notifications: </Text>
        <Switch
          value={notifications ?? false}
          onValueChange={setNotifications}
        />
      </View>

      {/* Object Preference */}
      <Text>Theme: {settings?.theme || 'Not set'}</Text>
      <Button
        title="Dark Theme"
        onPress={() => updateSettings({ theme: 'dark' })}
      />
      <Button
        title="Light Theme"
        onPress={() => updateSettings({ theme: 'light' })}
      />

      {/* Clear actions */}
      <Button title="Clear All" onPress={() => {
        clearUsername();
        clearNotifications();
        clearSettings();
      }} />
    </View>
  );
}
```

### Example 2: User Settings

```typescript
import Prefs from 'react-native-turbo-preferences';

class UserSettings {
  static async saveUserPreferences(userId: string, preferences: any) {
    const namespace = `user_${userId}`;
    await Prefs.setName(namespace);

    await Prefs.setMultiple([
      { key: 'theme', value: preferences.theme },
      { key: 'language', value: preferences.language },
      { key: 'notifications', value: String(preferences.notifications) },
    ]);
  }

  static async getUserPreferences(userId: string) {
    const namespace = `user_${userId}`;
    await Prefs.setName(namespace);

    const values = await Prefs.getMultiple([
      'theme',
      'language',
      'notifications',
    ]);
    return {
      theme: values.theme || 'light',
      language: values.language || 'en',
      notifications: values.notifications === 'true',
    };
  }
}
```

### Example 2: App Configuration

```typescript
import Prefs from 'react-native-turbo-preferences';

class AppConfig {
  static async initialize() {
    // Check if first run
    const isFirstRun = !(await Prefs.contains('appInitialized'));

    if (isFirstRun) {
      await Prefs.setMultiple([
        { key: 'appInitialized', value: 'true' },
        { key: 'version', value: '1.0.0' },
        { key: 'defaultTheme', value: 'system' },
      ]);
    }
  }

  static async getConfig() {
    const config = await Prefs.getMultiple([
      'version',
      'defaultTheme',
      'lastUpdateCheck',
    ]);

    return {
      version: config.version || '1.0.0',
      theme: config.defaultTheme || 'system',
      lastUpdate: config.lastUpdateCheck
        ? new Date(config.lastUpdateCheck)
        : null,
    };
  }
}
```

## 🔧 Configuration

### Namespace Management

```typescript
// Use default store
await Prefs.setName('');

// Use app group (iOS) or named file (Android)
await Prefs.setName('group.com.your.app');

// Use custom namespace
await Prefs.setName('UserSettings');
```

### Error Handling

```typescript
try {
  await Prefs.set('key', 'value');
} catch (error) {
  console.error('Failed to save preference:', error);
  // Handle error appropriately
}
```

## 📋 API Reference

### Imperative API

| Method                | Description       | Parameters                    | Returns                                   |
| --------------------- | ----------------- | ----------------------------- | ----------------------------------------- |
| `setName(name)`       | Switch namespace  | `name: string \| null`        | `Promise<void>`                           |
| `get(key)`            | Retrieve value    | `key: string`                 | `Promise<string \| null>`                 |
| `set(key, value)`     | Store value       | `key: string, value: string`  | `Promise<void>`                           |
| `clear(key)`          | Delete key        | `key: string`                 | `Promise<void>`                           |
| `contains(key)`       | Check existence   | `key: string`                 | `Promise<boolean>`                        |
| `setMultiple(values)` | Store multiple    | `values: Array<{key, value}>` | `Promise<void>`                           |
| `getMultiple(keys)`   | Retrieve multiple | `keys: string[]`              | `Promise<Record<string, string \| null>>` |
| `clearMultiple(keys)` | Delete multiple   | `keys: string[]`              | `Promise<void>`                           |
| `getAll()`            | Get all keys      | None                          | `Promise<Record<string, string>>`         |
| `clearAll()`          | Clear store       | None                          | `Promise<void>`                           |

### React Hooks API

| Hook                        | Description             | Parameters    | Returns                                     |
| --------------------------- | ----------------------- | ------------- | ------------------------------------------- |
| `usePreferenceString(key)`  | String preference hook  | `key: string` | `[value, setValue, contains, clear]`        |
| `usePreferenceNumber(key)`  | Number preference hook  | `key: string` | `[value, setValue, contains, clear]`        |
| `usePreferenceBoolean(key)` | Boolean preference hook | `key: string` | `[value, setValue, contains, clear]`        |
| `usePreferenceObject(key)`  | Object preference hook  | `key: string` | `[value, setValue, contains, clear]`        |
| `usePreferenceNamespace()`  | Namespace management    | None          | `[namespace, setNamespace, resetToDefault]` |

## 🔒 Security

> ⚠️ **Important Security Notice**

This library stores values in NSUserDefaults (iOS) and SharedPreferences (Android), which are **NOT secure**.

**Do NOT store sensitive data:**

- ❌ Passwords
- ❌ API tokens
- ❌ Credit card information
- ❌ Personal identification data

**For secure storage, use:**

- **iOS:** Keychain (`react-native-keychain`, `expo-secure-store`)
- **Android:** EncryptedSharedPreferences (`react-native-encrypted-storage`)

**Best Practices:**

- Only store non-sensitive app preferences
- Use namespaces to separate different data sets
- Implement proper data validation
- Consider encryption for sensitive data

## 🌍 Platform Support

| Platform     | Support | Notes                               |
| ------------ | ------- | ----------------------------------- |
| iOS          | ✅      | iOS 11.0+ (NSUserDefaults)          |
| Android      | ✅      | API Level 21+ (SharedPreferences)   |
| React Native | ✅      | 0.75+ with New Architecture enabled |
| Expo         | ✅      | Development builds & EAS builds     |

## 🎮 Demo / Example App

Try the interactive demo in the `example/` folder:

```bash
# Navigate to example
cd example

# Install dependencies
yarn install

# Start the demo
yarn start
```

The example app demonstrates:

- ✅ All API methods
- ✅ React Hooks usage
- ✅ Namespace switching
- ✅ Batch operations
- ✅ Error handling
- ✅ Real-time updates
- ✅ Tab navigation (Normal API, Hooks, Benchmarks)

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

## 📊 Performance

| Operation        | iOS    | Android | iOS Ops/sec             | Android Ops/sec           |
| ---------------- | ------ | ------- | ----------------------- | ------------------------- |
| Single Set (100) | 32ms   | 232ms   | 3,117                   | 431                       |
| Single Get (100) | 78ms   | 100ms   | 1,277                   | 995                       |
| Batch Set (100)  | ~0.1ms | 9ms     | 331,950                 | 11,700                    |
| Batch Get (100)  | 85ms   | 6ms     | 1,172                   | 18,000                    |
| Namespace Switch | 2ms    | 77ms    | 33,123                  | 646                       |
| Memory overhead  | ~4B    | ~12KB   | **0.04B per operation** | **0.12 KB per operation** |

> **Note:** All benchmarks from real device testing. iOS shows superior performance in most operations with ultra-low memory footprint.

### 📊 Memory Footprint Analysis

**Android Memory Testing Results (Real Device):**

| Test Type        | Operations | Memory Used | Memory per Operation | Notes                                 |
| ---------------- | ---------- | ----------- | -------------------- | ------------------------------------- |
| **Regular Test** | 100        | 12 KB       | 0.12 KB              | Efficient memory usage                |
| **Stress Test**  | 1,000      | 96 KB       | 0.096 KB             | Scales linearly, excellent efficiency |

**iOS Memory Testing Results (Real Device - iPhone SE):**

| Test Type        | Operations | Memory Used | Memory per Operation | Notes                        |
| ---------------- | ---------- | ----------- | -------------------- | ---------------------------- |
| **Regular Test** | 100        | 4B          | 0.04B                | Ultra-efficient memory usage |
| **Stress Test**  | 1,000      | 28B         | 0.028B               | Exceptional scalability      |

**Key Findings:**

**Android Memory Performance:**

- **Ultra-low memory overhead**: Only **0.12 KB per operation** (100 ops = 12 KB total)
- **Excellent scalability**: **0.096 KB per operation** at scale (1000 ops = 96 KB total)
- **Linear memory scaling**: Memory usage grows predictably: **12 KB → 96 KB** (8x operations = 8x memory)
- **Production efficiency**: **96 KB for 1000 operations** - suitable for high-frequency apps
- **Memory consistency**: **13 KB baseline overhead** maintained across all operations

**iOS Memory Performance:**

- **Exceptional memory efficiency**: Only **0.04B per operation** (100 ops = 4B total)
- **Outstanding scalability**: **0.028B per operation** at scale (1000 ops = 28B total)
- **Ultra-low baseline**: **4B baseline overhead** maintained across all operations
- **Memory advantage**: **3000x more memory efficient** than Android

**Cross-Platform Insights:**

- **iOS dominance**: Superior performance in most operations with ultra-low memory footprint
- **Android reliability**: Solid performance with excellent memory scaling
- **Production ready**: Both platforms show excellent efficiency for high-frequency apps

> **Memory testing performed on Samsung SM-A525F (Android 14) and iPhone SE (iOS 18) with real device benchmarks.**

## 🛠 Development

### Prerequisites

- Node.js 18 or higher
- React Native 0.75+
- iOS: Xcode 12+, iOS 11.0+
- Android: Android Studio, API Level 21+

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/hamzamekk/react-native-turbo-preferences.git
cd react-native-turbo-preferences

# Install dependencies
yarn install

# Build the project
yarn prepare

# Run tests
yarn test

# Type checking
yarn typecheck
```

### Scripts

```bash
yarn prepare        # Build for production
yarn test          # Run tests
yarn typecheck     # TypeScript checking
yarn lint          # Lint code
yarn example       # Run example app
```

## 🗺 Roadmap

- [x] ✅ Basic key-value operations
- [x] ✅ Cross-platform support
- [x] ✅ New Architecture (TurboModule)
- [x] ✅ Batch operations
- [x] ✅ Namespace support
- [x] ✅ TypeScript definitions
- [x] ✅ Performance monitoring & benchmarking (iOS + Android)
- [x] ✅ Memory footprint analysis (iOS + Android)
- [x] ✅ React hooks (usePreferenceString, usePreferenceNumber, usePreferenceBoolean, usePreferenceObject, usePreferenceNamespace)
- [ ] 🔜 `reloadWidgets()` — trigger `WidgetCenter.shared.reloadAllTimelines()` from JS after writing
- [ ] 🔜 Expo config plugin — auto-configure the App Group entitlement from `app.json`
- [ ] 🔜 Typed values (bool/int/double) so native readers get real types, not strings
- [ ] 🔜 Change listeners — react to writes from native code / sync hooks across components
- [ ] 🔜 Handle-based stores — use multiple namespaces at once without global `setName`

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

### How to Contribute

1. **Fork** the repository
2. **Create** a new branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes: `yarn test`
5. **Commit** your changes: `git commit -m 'Add amazing feature'`
6. **Push** to the branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Style

We use ESLint and Prettier. Run:

```bash
yarn lint
yarn lint:fix
```

## ❓ FAQ

<details>
<summary><strong>How do I handle errors in hooks?</strong></summary>

Hooks handle errors internally and log warnings to console. For custom error handling:

```typescript
const [value, setValue] = usePreferenceString('key');

const handleSave = async () => {
  try {
    await setValue('new value');
    console.log('Saved successfully!');
  } catch (error) {
    console.error('Save failed:', error);
    // Show user feedback
  }
};
```

</details>

<details>
<summary><strong>Do hooks automatically sync between components?</strong></summary>

No, hooks don't automatically sync. Each hook instance manages its own state. If you need real-time sync between components, consider using a state management library like Redux or Zustand with the imperative API.

</details>

<details>
<summary><strong>What's the difference between namespaces and keys?</strong></summary>

- **Namespace**: Different storage "files" (like `user_settings`, `app_config`)
- **Keys**: Individual preferences within a namespace (like `username`, `theme`)

```typescript
// Switch to user namespace
await Prefs.setName('user_settings');
await Prefs.set('username', 'John'); // Stored in user_settings

// Switch to app namespace
await Prefs.setName('app_config');
await Prefs.set('username', 'Admin'); // Different storage!
```

</details>

<details>
<summary><strong>Can I store complex objects?</strong></summary>

Yes! Use `usePreferenceObject` or store JSON strings manually:

```typescript
// With hook (recommended)
const [user, setUser] = usePreferenceObject<{ name: string; age: number }>(
  'user'
);

// Manual approach
await Prefs.set('user', JSON.stringify({ name: 'John', age: 30 }));
const userStr = await Prefs.get('user');
const user = userStr ? JSON.parse(userStr) : null;
```

</details>

<details>
<summary><strong>Is data encrypted or secure?</strong></summary>

**No!** This library uses NSUserDefaults (iOS) and SharedPreferences (Android), which store data in plain text.

**Never store sensitive data like:**

- Passwords, tokens, credit cards
- Personal identification numbers
- Any confidential information

**For secure storage, use:**

- `react-native-keychain` (iOS Keychain)
- `react-native-encrypted-storage` (Android EncryptedSharedPreferences)

</details>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Thanks to the React Native team for the New Architecture
- Inspired by the need for better performance in React Native apps
- Built with modern TypeScript and React Native best practices

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/hamzamekk/react-native-turbo-preferences/issues)
- 💡 **Request a Feature:** [Feature Requests](https://github.com/hamzamekk/react-native-turbo-preferences/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=)
- 📖 **Documentation:** [Full API Docs](https://github.com/hamzamekk/react-native-turbo-preferences#readme)
- 🌟 **Star this repo** if you found it helpful!
- 💬 **Discussions:** [GitHub Discussions](https://github.com/hamzamekk/react-native-turbo-preferences/discussions)

---

<div align="center">

**[⬆ Back to Top](#react-native-turbo-preferences)**

Made with ❤️ by [hamzamekk](https://github.com/hamzamekk)

</div>
