# react-native-turbo-preferences

⚡ A fast, cross-platform TurboModule for app preferences and key-value storage, using `NSUserDefaults` on iOS and `SharedPreferences` on Android.

[![npm version](https://img.shields.io/npm/v/react-native-turbo-preferences)](https://www.npmjs.com/package/react-native-turbo-preferences)
![platforms](https://img.shields.io/badge/platforms-ios%20%7C%20android-lightgrey)
![turbomodule](https://img.shields.io/badge/new%20architecture-ready-brightgreen)

## Features

- 🚀 **New Architecture ready** — implemented as a TurboModule
- 📱 **Cross-platform** — same JS API for iOS + Android
- 📦 **Lightweight** — wraps native APIs (`NSUserDefaults`, `SharedPreferences`)
- 🗂 **Namespace support** — switch between default store and named suite/file
- 🛠 **Batch operations** — set/get/remove multiple keys at once
- 🧹 **Full control** — get all keys, clear store, check existence

## Installation

```bash
npm install react-native-turbo-preferences
# or
yarn add react-native-turbo-preferences
```

If you’re in a bare React Native app, rebuild the app after installing:

```bash
npx pod-install
```

For Expo, this package works with EAS builds (config plugin included).

## API

### `setName(name?: string | null): Promise<void>`

Switches the storage namespace.

- iOS: calls `UserDefaults(suiteName:)`
- Android: calls `getSharedPreferences(name, MODE_PRIVATE)`

### `get(key: string): Promise<string | null>`

Returns the value for a key, or `null` if missing.

### `set(key: string, value: string): Promise<void>`

Stores a string value.

### `remove(key: string): Promise<void>`

Deletes a key.

### `contains(key: string): Promise<boolean>`

Checks if the key exists.

### `setMultiple(values: { [key: string]: string }): Promise<void>`

Sets multiple keys at once.

### `getMultiple(keys: string[]): Promise<{ [key: string]: string | null }>`

Retrieves multiple keys at once.

### `removeMultiple(keys: string[]): Promise<void>`

Removes multiple keys at once.

### `getAll(): Promise<{ [key: string]: string }>`

Returns all keys/values in the current store.

### `clearAll(): Promise<void>`

Clears the current store.

## Usage

```ts
import Prefs from 'react-native-turbo-preferences';

async function demo() {
  await Prefs.setName('MyPrefs');
  await Prefs.set('username', 'Hamza');
  const username = await Prefs.get('username');
  console.log(username); // "Hamza"

  const exists = await Prefs.contains('username');
  console.log('Contains username?', exists);

  await Prefs.clearAll();
}
```

## Platform Notes

```md
iOS

- Values are stored using `NSUserDefaults`.
- Use an **App Group ID** in `setName` to share data with extensions or widgets.
- Supports property list types (`String`, `Number`, `Bool`, `Date`, `Data`, arrays, and dictionaries).  
  This library only exposes **string** values to keep the API simple.

Android

- Values are stored using `SharedPreferences`.
- `setName` switches to a different preferences file.
- Also supports primitive types natively, but this API only exposes strings.
```

## License

MIT © [Hamza El Mekkoudi]
