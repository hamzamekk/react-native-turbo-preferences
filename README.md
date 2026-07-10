# React Native Turbo Preferences

[![npm version](https://img.shields.io/npm/v/react-native-turbo-preferences.svg)](https://www.npmjs.com/package/react-native-turbo-preferences)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/hamzamekk/react-native-turbo-preferences/workflows/CI/badge.svg)](https://github.com/hamzamekk/react-native-turbo-preferences/actions)
[![React Native](https://img.shields.io/badge/React%20Native-New%20Architecture-blue.svg)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

> ⚡ Share preferences between your React Native app and **iOS widgets, watch apps, and app extensions** — App Groups (`NSUserDefaults`) on iOS, `SharedPreferences` on Android. Built as a TurboModule for React Native's New Architecture.

Your React Native JS code can't be seen by a WidgetKit widget, a watchOS app, or a share extension — the only bridge between them is a shared native store. This library gives you direct, typed access to that store: `UserDefaults(suiteName:)` App Group containers on iOS and named `SharedPreferences` files on Android.

It's also a great fit whenever native code (SDKs, Settings.bundle, Android home-screen widgets) needs to read values your JS writes — or plain fast key-value storage for app preferences.

```typescript
import { createStore, reloadWidgets } from 'react-native-turbo-preferences';

const appGroup = createStore('group.com.yourcompany.yourapp');

await appGroup.setInt('streak', 42); // a real integer — no string parsing
await appGroup.setBoolean('goalReached', true);
await reloadWidgets(); // your widget refreshes now, not "eventually"
```

## 🌟 Features

- 📲 **App Group Sharing** — Write from JS, read from your iOS widget, watch app, or extension
- 🔌 **Expo Config Plugin** — Auto-configures the App Group entitlement on prebuild, no Xcode needed
- 🗂 **Multiple Stores** — Handles to the default store, named files, and App Groups, all usable side by side
- 🔢 **Typed Values** — Booleans, ints, and doubles stored as real native types
- 📡 **Change Listeners** — React to writes from native code; hooks stay in sync across components
- 🔄 **Widget Refresh** — `reloadWidgets()` triggers WidgetKit / AppWidget updates from JS
- 🪝 **React Hooks** — Reactive `usePreference*` hooks with automatic cross-component sync
- 🚀 **New Architecture Native** — A true TurboModule, not an old bridge module running through interop
- 📦 **Lightweight** — Wraps `NSUserDefaults` / `SharedPreferences` directly, no custom storage format
- 🔒 **Type Safe** — Written in TypeScript with full type definitions

## 🤔 Why this library?

The two libraries most apps use for App Group / native preference sharing haven't shipped a release in years:

|                     | react-native-turbo-preferences                                                    | [react-native-shared-group-preferences](https://www.npmjs.com/package/react-native-shared-group-preferences)                            | [react-native-default-preference](https://www.npmjs.com/package/react-native-default-preference) |
| ------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Actively maintained | ✅                                                                                 | ❌ Last release Sept 2023                                                                                                                 | ❌ Last release June 2022                                                                           |
| New Architecture    | ✅ Native TurboModule                                                              | ⚠️ Old bridge (via interop layer)                                                                                                         | ⚠️ Old bridge (via interop layer)                                                                   |
| iOS App Groups      | ✅ `UserDefaults(suiteName:)`                                                      | ✅                                                                                                                                        | ✅                                                                                                  |
| Android backend     | ✅ `SharedPreferences` (app-sandboxed)                                             | ⚠️ Public external-storage JSON file, needs storage permissions, readable by other apps                                                   | ✅ `SharedPreferences`                                                                              |
| Expo                | ✅ Config plugin ([guide below](#-sharing-data-with-an-ios-widget-app-groups))     | ❌ "Doesn't work for Expo" (their README)                                                                                                 | ⚠️ Undocumented                                                                                     |
| Multiple stores at once | ✅ Handle-based (`createStore`)                                                | ❌                                                                                                                                        | ❌ Global `setName` switch                                                                          |
| Typed values        | ✅ bool / int / double stored natively                                             | ⚠️ JSON blob                                                                                                                              | ❌ Strings only                                                                                     |
| Change listeners    | ✅ Incl. native writes                                                             | ❌                                                                                                                                        | ❌                                                                                                  |
| React hooks         | ✅ Auto-syncing                                                                    | ❌                                                                                                                                        | ❌                                                                                                  |
| Widget refresh from JS | ✅ `reloadWidgets()`                                                            | ❌                                                                                                                                        | ❌                                                                                                  |
| TypeScript          | ✅ Written in TS                                                                   | ❌                                                                                                                                        | ⚠️ Type definitions only                                                                            |

## 📦 Installation

```bash
npm install react-native-turbo-preferences
# or
yarn add react-native-turbo-preferences
```

**Bare React Native:**

```bash
npx pod-install
```

**Expo:** works with development builds / EAS. To share data with widgets or extensions, add the config plugin to `app.json`:

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

> Requires the New Architecture (default since React Native 0.76). Old-architecture apps can't use this library.

## 🚀 Quick Start

### Stores

```typescript
import Prefs, { createStore } from 'react-native-turbo-preferences';

// Top-level functions use the default store
await Prefs.set('username', 'Hamza');
const username = await Prefs.get('username'); // "Hamza"

// Named stores are handles — use as many as you need, at the same time
const settings = createStore('settings');
const appGroup = createStore('group.com.yourcompany.yourapp');

await settings.set('theme', 'dark');
await appGroup.setInt('streak', 42); // visible to your widget
```

### Hooks

```tsx
import { usePreferenceString, createStore } from 'react-native-turbo-preferences';

const appGroup = createStore('group.com.yourcompany.yourapp');

function Profile() {
  const [username, setUsername, hasUsername, clearUsername] =
    usePreferenceString('username');
  // Scope a hook to a store by passing the handle:
  const [workout] = usePreferenceString('lastWorkout', appGroup);

  return (
    <View>
      <Text>{username ?? 'Not set'}</Text>
      <Button title="Set" onPress={() => setUsername('Hamza')} />
    </View>
  );
}
```

Hooks subscribe to change events: two components using the same key stay in sync, and the UI updates when native code writes the key.

## 📲 Sharing data with an iOS Widget (App Groups)

This is the flagship use case: your React Native app writes a value, and your WidgetKit widget (or watch app / share extension / App Clip) reads it natively. Both sides just need to point at the same **App Group**.

### 1. Enable the App Group

**Bare React Native:** in Xcode, select your app target → _Signing & Capabilities_ → _+ Capability_ → **App Groups** → add a group like `group.com.yourcompany.yourapp`. Repeat for your widget/extension target with the **same** group id.

**Expo:** use the built-in config plugin (see [Installation](#-installation)) — it adds the entitlement during `expo prebuild` / EAS Build, merging with any existing App Groups. To create the widget extension target itself in an Expo project, use a target plugin such as [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets), and give the widget target the same App Group entitlement.

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
import { reloadWidgets } from 'react-native-turbo-preferences';

await appGroup.setInt('streak', 43);
await reloadWidgets(); // WidgetCenter.shared.reloadAllTimelines()
await reloadWidgets('StreakWidget'); // …or only one kind: reloadTimelines(ofKind:)
```

On Android, `reloadWidgets()` broadcasts `ACTION_APPWIDGET_UPDATE` to all of your app's widget providers (the `kind` argument is iOS-only and ignored).

### Android: sharing with native code

On Android, `createStore('my_file')` maps to `getSharedPreferences("my_file", MODE_PRIVATE)` — the same file any native code in **your own app** (a Glance/home-screen widget, a headless service, an SDK) can read:

```kotlin
val prefs = context.getSharedPreferences("my_file", Context.MODE_PRIVATE)
val streak = prefs.getInt("streak", 0)
val goalReached = prefs.getBoolean("goalReached", false)
val workout = prefs.getString("lastWorkout", null)
```

Data stays inside your app's sandbox. (Unlike libraries that write a world-readable JSON file to external storage, other apps can't read, edit, or delete it — and no storage permissions are required.)

## 📖 API Reference

### `createStore(name?: string): PreferenceStore`

Creates a handle to a preference store. Handles are cheap JS objects — create as many as you need and use several stores **at the same time**, with no global state.

- `name` — iOS: `UserDefaults` suite (e.g. an App Group). Android: `SharedPreferences` file name. Omit for the default store.

A `PreferenceStore` exposes the full API scoped to that store:

| Method                   | Description                | Returns                                   |
| ------------------------ | -------------------------- | ----------------------------------------- |
| `get(key)`               | Retrieve string            | `Promise<string \| null>`                 |
| `set(key, value)`        | Store string               | `Promise<void>`                           |
| `clear(key)`             | Delete key                 | `Promise<void>`                           |
| `contains(key)`          | Check existence            | `Promise<boolean>`                        |
| `setBoolean(key, value)` | Store native boolean       | `Promise<void>`                           |
| `getBoolean(key)`        | Retrieve boolean           | `Promise<boolean \| null>`                |
| `setInt(key, value)`     | Store native int32         | `Promise<void>`                           |
| `getInt(key)`            | Retrieve integer           | `Promise<number \| null>`                 |
| `setDouble(key, value)`  | Store native double/float  | `Promise<void>`                           |
| `getDouble(key)`         | Retrieve double            | `Promise<number \| null>`                 |
| `setMultiple(values)`    | Store multiple strings     | `Promise<void>`                           |
| `getMultiple(keys)`      | Retrieve multiple          | `Promise<Record<string, string \| null>>` |
| `clearMultiple(keys)`    | Delete multiple            | `Promise<void>`                           |
| `getAll()`               | All keys/values (as strings) | `Promise<Record<string, string>>`       |
| `clearAll()`             | Wipe the store             | `Promise<void>`                           |
| `addListener(fn)`        | Changes in this store only | `EventSubscription`                       |
| `name`                   | The store's name (`null` = default) | `string \| null`                 |

The same functions are exported at the top level (`import { get, set, … }`) operating on the **default store**.

### Typed values

Booleans and numbers are stored as **real native types** (not strings), so native readers use their normal typed accessors: `integer(forKey:)` / `bool(forKey:)` on iOS, `getInt` / `getBoolean` on Android.

```typescript
await store.setBoolean('darkMode', true);
await store.setInt('streak', 42); // must be a 32-bit integer, rejects otherwise
await store.setDouble('progress', 0.75);

const streak = await store.getInt('streak'); // 42, or null if missing
```

- iOS: `setBool` / `setInteger` / `setDouble` — Android: `putBoolean` / `putInt` / `putFloat`
- Android has no `putDouble`, so doubles round-trip with **Float precision** on Android
- Typed getters resolve `null` when the key is missing or holds an incompatible type

### Change listeners

```typescript
import { addPreferenceChangeListener } from 'react-native-turbo-preferences';

// All stores: event.store says which one changed (null = default)
const sub = addPreferenceChangeListener((event) => {
  console.log(`"${event.key}" changed in ${event.store ?? 'default'}`);
});

// One store:
const storeSub = appGroup.addListener((event) => {
  console.log('widget data changed:', event.key);
});

sub.remove();
```

Fires for writes made through this module **and by native code** (widgets, watch apps, SDKs). `event.key` is `null` when the whole store changed at once (e.g. `clearAll`).

**Platform behavior:**

- **iOS:** `NSUserDefaultsDidChangeNotification`, diffed per key against per-store snapshots. Fires for changes made within your app's process.
- **Android:** `SharedPreferences.OnSharedPreferenceChangeListener` per store.

### Widgets

#### `reloadWidgets(kind?: string): Promise<void>`

Asks the OS to refresh your home-screen widgets so they pick up newly written values.

- **iOS:** `WidgetCenter.shared.reloadAllTimelines()`, or `reloadTimelines(ofKind:)` when `kind` is passed
- **Android:** broadcasts `ACTION_APPWIDGET_UPDATE` to all of the app's widget providers (`kind` ignored)

### Deprecated: `setName(name)`

Switches the store that the top-level functions point at. **Prefer `createStore()`** — `setName` is a global switch shared by every call in your app, which invites subtle bugs when two features use different namespaces. Existing code keeps working.

> Migration note (v2): the selection now lives in JS and resets on app restart — this was always Android's behavior; iOS used to persist it across launches.

## 🪝 React Hooks

All value hooks return `[value, setValue, contains, clear]`, load automatically on mount, and **stay in sync**: every hook instance watching a key updates when that key changes — from another component, the imperative API, or native code.

| Hook                              | Value type       | Notes                                    |
| --------------------------------- | ---------------- | ---------------------------------------- |
| `usePreferenceString(key, store?)`  | `string \| null`  |                                          |
| `usePreferenceNumber(key, store?)`  | `number \| null`  | stored as string, parsed on read         |
| `usePreferenceBoolean(key, store?)` | `boolean \| null` | accepts `"true"/"false"/"1"/"0"`         |
| `usePreferenceObject<T>(key, store?)` | `T \| null`     | JSON (de)serialization built in          |
| `usePreferenceNamespace()` ⚠️ deprecated | —           | drives the global `setName` store        |

`store` is an optional `PreferenceStore` handle from `createStore()`; omit it to use the default store (or the one selected with `setName`).

```tsx
import {
  usePreferenceBoolean,
  usePreferenceObject,
} from 'react-native-turbo-preferences';

interface UserSettings {
  fontSize: number;
  language: string;
}

function SettingsScreen() {
  const [notifications, setNotifications] = usePreferenceBoolean('notifications');
  const [settings, setSettings] = usePreferenceObject<UserSettings>('userSettings');

  return (
    <View>
      <Switch value={notifications ?? false} onValueChange={setNotifications} />
      <Button
        title="Bigger text"
        onPress={() =>
          setSettings({ language: 'en', ...settings, fontSize: 18 })
        }
      />
    </View>
  );
}
```

## 🔀 Migrating

### From v1 of this library

- `setName()` and all top-level functions keep working. New code should use `createStore()`.
- The **default export** is now a wrapper object with the same methods (previously the raw native module). If you called methods on the default export, nothing changes; if you accessed the native module directly, switch to named imports.
- On iOS, the `setName` selection no longer persists across app restarts (it never did on Android).

### From react-native-default-preference

```typescript
// before                                   // after
DefaultPreference.setName('group.myapp');   const store = createStore('group.myapp');
DefaultPreference.get('key');               store.get('key');
DefaultPreference.set('key', 'v');          store.set('key', 'v');
DefaultPreference.clearAll();               store.clearAll();
```

`getMultiple` returns an object here (not an array), and `setMultiple` takes `[{ key, value }]` pairs.

### From react-native-shared-group-preferences

```typescript
// before
SharedGroupPreferences.setItem('key', value, 'group.myapp');
SharedGroupPreferences.getItem('key', 'group.myapp');

// after
const store = createStore('group.myapp');
store.set('key', JSON.stringify(value)); // it JSON-serialized for you
JSON.parse((await store.get('key')) ?? 'null');
```

On Android you also gain sandboxed storage — the old library wrote a world-readable JSON file to external storage.

## 🔒 Security

This library stores values in `NSUserDefaults` (iOS) and `SharedPreferences` (Android), which are **not encrypted**.

**Do NOT store:** passwords, API tokens, payment data, or personal identification data.

**For secure storage use:** Keychain on iOS (`react-native-keychain`, `expo-secure-store`) and `EncryptedSharedPreferences` on Android (`react-native-encrypted-storage`).

## 🌍 Platform Support

| Platform     | Support | Notes                                    |
| ------------ | ------- | ---------------------------------------- |
| iOS          | ✅      | `NSUserDefaults`, App Groups, WidgetKit  |
| Android      | ✅      | `SharedPreferences`, AppWidget broadcast |
| React Native | ✅      | New Architecture only (default since 0.76) |
| Expo         | ✅      | Development builds & EAS, config plugin  |

## 🎮 Example App

The `example/` folder is an interactive tour of the whole API — stores, typed values, live change-event log, and hook synchronization:

```bash
yarn install
cd example
yarn ios      # or: yarn android
```

## 📊 Performance

Operations go straight to `NSUserDefaults` / `SharedPreferences` over JSI (no bridge serialization), and both platforms batch writes natively (`apply()` on Android, background persistence on iOS). For high-frequency writes of large blobs consider MMKV instead — this library's niche is preferences that **native code needs to read**.

## 🗺 Roadmap

- [x] ✅ Batch operations, namespaces, TypeScript, hooks
- [x] ✅ Expo config plugin — App Group entitlement from `app.json`
- [x] ✅ `reloadWidgets()` — WidgetKit / AppWidget refresh from JS
- [x] ✅ Typed values (bool/int/double) stored as real native types
- [x] ✅ Change listeners + auto-syncing hooks
- [x] ✅ Handle-based stores (`createStore`) — no more global `setName`
- [ ] 🔜 Typed hooks — back `usePreferenceNumber`/`usePreferenceBoolean` with native typed storage
- [ ] 🔜 Cross-process change detection on iOS (KVO) — see changes a widget writes while the app runs
- [ ] 🔜 Swift Package Manager support (tracking the [RN SPM RFC](https://github.com/react-native-community/discussions-and-proposals/pull/994))
- [ ] 🔜 Store deletion (`deleteSharedPreferences` / remove suite)

## ❓ FAQ

<details>
<summary><strong>Do hooks automatically sync between components?</strong></summary>

Yes. Hooks subscribe to store change events, so every hook instance watching a key updates when that key changes — whether the write came from another component, the imperative API, or native code. For cross-cutting logic outside components, use `addPreferenceChangeListener`.

</details>

<details>
<summary><strong>Can I use several stores at the same time?</strong></summary>

Yes — that's what `createStore()` is for. Each handle is independent; there is no global switching:

```typescript
const defaults = createStore();
const appGroup = createStore('group.com.your.app');
await defaults.set('lastScreen', 'home');
await appGroup.setInt('streak', 42);
```

</details>

<details>
<summary><strong>Can I store complex objects?</strong></summary>

Use `usePreferenceObject<T>` (JSON built in) or store JSON strings manually:

```typescript
await store.set('user', JSON.stringify({ name: 'John', age: 30 }));
const user = JSON.parse((await store.get('user')) ?? 'null');
```

</details>

<details>
<summary><strong>Why does my widget not update immediately?</strong></summary>

iOS controls widget timeline refreshes. Call `reloadWidgets()` after writing to force an immediate refresh. Also confirm both targets use the exact same App Group id.

</details>

<details>
<summary><strong>Is data encrypted or secure?</strong></summary>

No — `NSUserDefaults` and `SharedPreferences` store data in plain text inside your app's sandbox. Never store secrets; see [Security](#-security).

</details>

## 🤝 Contributing

1. Fork and branch: `git checkout -b feature/amazing-feature`
2. Make your changes and run `yarn test && yarn typecheck && yarn lint`
3. Commit using [conventional commits](https://www.conventionalcommits.org/) and open a PR

## 📄 License

MIT — see [LICENSE](LICENSE).

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/hamzamekk/react-native-turbo-preferences/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/hamzamekk/react-native-turbo-preferences/discussions)
- 🌟 **Star this repo** if you found it helpful!

---

<div align="center">

Made with ❤️ by [hamzamekk](https://github.com/hamzamekk)

</div>
