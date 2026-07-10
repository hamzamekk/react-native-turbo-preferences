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
- 🔌 **Expo Config Plugin** — Auto-configures the App Group entitlement on prebuild, no Xcode needed
- 🚀 **New Architecture Native** — A true TurboModule, not an old bridge module running through interop
- 🪝 **React Hooks** — Convenient hooks for reactive state management
- 📱 **Cross-Platform** — Same JS API for iOS + Android with native optimizations
- 📦 **Lightweight** — Wraps native APIs (NSUserDefaults, SharedPreferences) directly, no custom storage format
- 🗂 **Multiple Stores** — Hold handles to the default store, named files, and App Groups side by side
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
| Expo                  | ✅ Config plugin ([guide below](#-sharing-data-with-an-ios-widget-app-groups)) | ❌ "Doesn't work for Expo" (their README)        | ⚠️ Undocumented                               |
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
Works with development builds and EAS. To share data with widgets/extensions, add the [config plugin](#-sharing-data-with-an-ios-widget-app-groups) to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-turbo-preferences",
        { "appGroup": "group.com.yourcompany.yourapp" }
      ]
    ]
  }
}
```

## 🚀 Quick Start

### Imperative API

```typescript
import Prefs, { createStore } from 'react-native-turbo-preferences';

// Basic usage (default store)
await Prefs.set('username', 'Hamza');
const username = await Prefs.get('username');
console.log(username); // "Hamza"

// Named stores are handles — use as many as you need, at the same time
const settings = createStore('settings');
const appGroup = createStore('group.com.yourcompany.yourapp');

await settings.set('theme', 'dark');
await appGroup.setInt('streak', 42); // visible to your widget
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

**Expo:** use the built-in config plugin — it adds the App Group entitlement to your app target during `expo prebuild` / EAS Build:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-turbo-preferences",
        { "appGroup": "group.com.yourcompany.yourapp" }
      ]
    ]
  }
}
```

The plugin merges with any existing App Groups, deduplicates, and accepts an array (`"appGroup": ["group.a", "group.b"]`) if you share more than one. Prefer configuring it manually? Setting `ios.entitlements["com.apple.security.application-groups"]` in `app.json` works too.

> To create the widget extension target itself in an Expo project, use a target plugin such as [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets), and give the widget target the same App Group entitlement.

### 2. Write from React Native

```typescript
import { createStore } from 'react-native-turbo-preferences';

const appGroup = createStore('group.com.yourcompany.yourapp');

await appGroup.setInt('streak', 42); // stored as a real integer
await appGroup.setBoolean('goalReached', true); // stored as a real boolean
await appGroup.set('lastWorkout', 'Push day'); // strings via set()
```

The handle only touches the App Group container — the rest of your app keeps using the default store (or other handles) at the same time.

### 3. Read from your widget (Swift)

Because values are stored as real native types, your widget reads them with the normal typed `UserDefaults` accessors — no string parsing:

```swift
struct Provider: TimelineProvider {
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    let defaults = UserDefaults(suiteName: "group.com.yourcompany.yourapp")
    let streak = defaults?.integer(forKey: "streak") ?? 0
    let goalReached = defaults?.bool(forKey: "goalReached") ?? false
    let workout = defaults?.string(forKey: "lastWorkout") ?? "—"
    // build your timeline entry from these values …
  }
}
```

### 4. Refresh the widget

iOS decides when widget timelines refresh on their own. To make the widget pick up your new values immediately, call `reloadWidgets()` after writing:

```typescript
import Prefs, { reloadWidgets } from 'react-native-turbo-preferences';

await Prefs.set('streak', '43');
await reloadWidgets(); // WidgetCenter.shared.reloadAllTimelines()
await reloadWidgets('StreakWidget'); // …or only one kind: reloadTimelines(ofKind:)
```

On Android, `reloadWidgets()` broadcasts `ACTION_APPWIDGET_UPDATE` to all of your app's widget providers (the `kind` argument is iOS-only and ignored).

### Android: sharing with native code

On Android, `setName('my_file')` maps to `getSharedPreferences("my_file", MODE_PRIVATE)` — the same file any native code in **your own app** (a Glance/home-screen widget, a headless service, an SDK) can read:

```kotlin
val prefs = context.getSharedPreferences("my_file", Context.MODE_PRIVATE)
val streak = prefs.getInt("streak", 0)
val goalReached = prefs.getBoolean("goalReached", false)
val workout = prefs.getString("lastWorkout", null)
```

Data stays inside your app's sandbox. (Unlike libraries that write a world-readable JSON file to external storage, other apps can't read, edit, or delete it — and no storage permissions are required.)

## 📖 API Documentation

### Stores

#### `createStore(name?: string): PreferenceStore`

Creates a handle to a preference store. Handles are cheap JS objects — create as many as you need and use several stores **at the same time**, with no global state.

**Parameters:**

- `name` (string, optional) - iOS: `UserDefaults` suite (e.g. an App Group). Android: `SharedPreferences` file name. Omit for the default store.

**Returns:** a `PreferenceStore` with the full API scoped to that store: `get`/`set`/`clear`/`contains`, typed values, batch ops, `getAll`/`clearAll`, and `addListener` (fires only for that store's changes).

**Example:**

```typescript
const settings = createStore('settings');
const appGroup = createStore('group.com.yourcompany.yourapp');

await settings.set('theme', 'dark');
await appGroup.setInt('streak', 42);

const sub = appGroup.addListener((event) => {
  console.log('widget data changed:', event.key);
});
```

### Basic Methods

The top-level functions below operate on the **default store** (or the store selected with the deprecated `setName`).

#### `setName(name?: string | null): Promise<void>` (deprecated)

Switches the store the top-level functions point at. **Prefer `createStore()`** — `setName` is a global switch shared by every call in your app, which invites subtle bugs when two features use different namespaces.

> Migration note: the selection now lives in JS and resets on app restart — this was always Android's behavior; iOS used to persist it across launches.

```typescript
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

### Typed Values

Booleans and numbers are stored as **real native types** (not strings), so native readers — widgets, watch apps, SDKs — use their normal typed accessors: `integer(forKey:)` / `bool(forKey:)` on iOS, `getInt` / `getBoolean` on Android.

#### `setBoolean(key: string, value: boolean)` / `getBoolean(key: string)`

```typescript
await setBoolean('darkMode', true);
const darkMode = await getBoolean('darkMode'); // true, or null if missing
```

- iOS: `setBool(_:forKey:)` — Android: `putBoolean`

#### `setInt(key: string, value: number)` / `getInt(key: string)`

```typescript
await setInt('streak', 42);
const streak = await getInt('streak'); // 42, or null if missing
```

- Value must be a 32-bit integer (−2,147,483,648 … 2,147,483,647); `setInt` rejects otherwise
- iOS: `set(Int, forKey:)` — Android: `putInt`

#### `setDouble(key: string, value: number)` / `getDouble(key: string)`

```typescript
await setDouble('progress', 0.75);
const progress = await getDouble('progress'); // 0.75, or null if missing
```

- iOS: `set(Double, forKey:)` — Android: `putFloat` (SharedPreferences has no `putDouble`, so values round-trip with Float precision on Android)

> Typed getters resolve `null` when the key is missing or holds an incompatible type (e.g. a string). Use `get()`/`set()` for strings, and `usePreferenceObject` / JSON for objects.

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

### Change Listeners

#### `addPreferenceChangeListener(listener): EventSubscription`

Fires when a value in the current store changes — **including writes made by native code** (widgets, watch apps, SDKs), not just through this module.

```typescript
import { addPreferenceChangeListener } from 'react-native-turbo-preferences';

const subscription = addPreferenceChangeListener((event) => {
  console.log('changed:', event.key); // null when the whole store changed at once
});

// later
subscription.remove();
```

**Platform behavior:**

- **iOS:** `NSUserDefaultsDidChangeNotification`, diffed per key against a snapshot of the store's persistent domain. Fires for changes made within your app's process.
- **Android:** `SharedPreferences.OnSharedPreferenceChangeListener` on the current file. `event.key` is `null` when the store was cleared as a whole (API 30+).

> Hooks subscribe automatically — two components using `usePreferenceString('username')` now stay in sync, and both update if native code writes the key.

### Widget Operations

#### `reloadWidgets(kind?: string): Promise<void>`

Asks the OS to refresh your home-screen widgets so they pick up newly written values.

**Parameters:**

- `kind` (string, optional) - iOS only: refresh a single widget kind (the `kind` you pass to your `WidgetConfiguration`). Omit to refresh all.

**Platform behavior:**

- **iOS:** `WidgetCenter.shared.reloadAllTimelines()`, or `reloadTimelines(ofKind:)` when `kind` is passed
- **Android:** broadcasts `ACTION_APPWIDGET_UPDATE` to all of the app's widget providers (`kind` ignored)

**Example:**

```typescript
await Prefs.set('streak', '43');
await reloadWidgets();
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

### Working with Multiple Stores

```typescript
import { createStore } from 'react-native-turbo-preferences';

const defaults = createStore(); // default store
const appGroup = createStore('group.com.your.app'); // iOS App Group
const settings = createStore('UserSettings'); // named file

// All usable at the same time — no global switching
await defaults.set('lastScreen', 'home');
await appGroup.setInt('streak', 42);
await settings.setBoolean('darkMode', true);
```

Hooks accept a store handle as their second argument:

```typescript
const appGroup = createStore('group.com.your.app');

function StreakBadge() {
  const [streak] = usePreferenceNumber('streak', appGroup);
  return <Text>{streak ?? 0}</Text>;
}
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
| `createStore(name?)`  | Create a store handle | `name?: string`           | `PreferenceStore`                         |
| `setName(name)` ⚠️ deprecated | Switch global namespace | `name: string \| null` | `Promise<void>`                     |
| `get(key)`            | Retrieve value    | `key: string`                 | `Promise<string \| null>`                 |
| `set(key, value)`     | Store value       | `key: string, value: string`  | `Promise<void>`                           |
| `clear(key)`          | Delete key        | `key: string`                 | `Promise<void>`                           |
| `contains(key)`       | Check existence   | `key: string`                 | `Promise<boolean>`                        |
| `setBoolean(key, value)` | Store native boolean | `key: string, value: boolean` | `Promise<void>`                     |
| `getBoolean(key)`     | Retrieve boolean  | `key: string`                 | `Promise<boolean \| null>`                |
| `setInt(key, value)`  | Store native int32 | `key: string, value: number` | `Promise<void>`                           |
| `getInt(key)`         | Retrieve integer  | `key: string`                 | `Promise<number \| null>`                 |
| `setDouble(key, value)` | Store native double/float | `key: string, value: number` | `Promise<void>`                  |
| `getDouble(key)`      | Retrieve double   | `key: string`                 | `Promise<number \| null>`                 |
| `addPreferenceChangeListener(fn)` | Subscribe to store changes | `fn: (event) => void` | `EventSubscription`              |
| `setMultiple(values)` | Store multiple    | `values: Array<{key, value}>` | `Promise<void>`                           |
| `getMultiple(keys)`   | Retrieve multiple | `keys: string[]`              | `Promise<Record<string, string \| null>>` |
| `clearMultiple(keys)` | Delete multiple   | `keys: string[]`              | `Promise<void>`                           |
| `getAll()`            | Get all keys      | None                          | `Promise<Record<string, string>>`         |
| `clearAll()`          | Clear store       | None                          | `Promise<void>`                           |
| `reloadWidgets(kind?)` | Refresh home-screen widgets | `kind?: string` (iOS only) | `Promise<void>`                    |

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
- [x] ✅ `reloadWidgets()` — trigger `WidgetCenter.shared.reloadAllTimelines()` from JS after writing
- [x] ✅ Expo config plugin — auto-configure the App Group entitlement from `app.json`
- [x] ✅ Typed values (bool/int/double) so native readers get real types, not strings
- [x] ✅ Change listeners — react to writes from native code / sync hooks across components
- [x] ✅ Handle-based stores — use multiple namespaces at once without global `setName`

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

Yes. Hooks subscribe to store change events, so every hook instance watching a key updates when that key changes — whether the write came from another component, the imperative API, or native code. For cross-cutting logic outside components, use `addPreferenceChangeListener`.

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
