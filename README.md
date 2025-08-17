react-native-turbo-preferences

⚡ A fast, cross-platform TurboModule for app preferences and key-value storage, using NSUserDefaults on iOS and SharedPreferences on Android.

✨ Features

🚀 New Architecture ready — implemented as a TurboModule

📱 Cross-platform — same JS API for iOS + Android

📦 Lightweight — wraps native APIs (NSUserDefaults, SharedPreferences)

🗂 Namespace support — switch between default store and named suite/file

🛠 Batch operations — set/get/remove multiple keys at once

🧹 Full control — get all keys, clear store, check existence

📦 Installation
npm install react-native-turbo-preferences

# or

yarn add react-native-turbo-preferences

If you’re in a bare React Native app, rebuild after installing:

npx pod-install

For Expo, this package works with EAS builds (includes a config plugin).

🚨 Security Notice

This library stores values in NSUserDefaults (iOS) and SharedPreferences (Android), which are not secure.
Do not store sensitive data (passwords, tokens, credit card info).

For secure storage, use:

iOS: Keychain (react-native-keychain, expo-secure-store)

Android: EncryptedSharedPreferences (react-native-encrypted-storage)

📚 API
Quick Reference Table
Method Description Parameters Returns
setName(name?: string | null) Switches storage namespace name (string or null) Promise<void>
get(key: string) Retrieves a value key (string) Promise<string | null>
set(key: string, value: string) Stores a value key (string), value (string) Promise<void>
remove(key: string) Deletes a value key (string) Promise<void>
contains(key: string) Checks if key exists key (string) Promise<boolean>
setMultiple(values: Record<string, string>) Stores multiple keys values (object) Promise<void>
getMultiple(keys: string[]) Retrieves multiple keys keys (array) Promise<Record<string, string | null>>
clearMultiple(keys: string[]) Deletes multiple keys keys (array) Promise<void>
getAll() Retrieves all key-value pairs None Promise<Record<string, string>>
clearAll() Clears all keys None Promise<void>
Detailed Methods
setName(name?: string | null): Promise<void>

Switches the storage namespace.

iOS: uses UserDefaults(suiteName:)

Android: uses getSharedPreferences(name, MODE_PRIVATE)

Pass null/undefined to reset to default store.

get(key: string): Promise<string | null>

Returns the value for a key, or null if missing.

set(key: string, value: string): Promise<void>

Stores a string value.

remove(key: string): Promise<void>

Deletes a key.

contains(key: string): Promise<boolean>

Checks if the key exists.

setMultiple(values: { [key: string]: string }): Promise<void>

Sets multiple keys at once.

getMultiple(keys: string[]): Promise<{ [key: string]: string | null }>

Retrieves multiple keys at once.

clearMultiple(keys: string[]): Promise<void>

Removes multiple keys at once.

getAll(): Promise<{ [key: string]: string }>

Returns all keys/values in the current store. Always returns an object — {} if empty.

clearAll(): Promise<void>

Clears the current store.

💻 Usage
import Prefs from 'react-native-turbo-preferences';

async function demo() {
// Use a named store
await Prefs.setName('MyPrefs');

// Set a value
await Prefs.set('username', 'Hamza');

// Get a value
const username = await Prefs.get('username');
console.log(username); // "Hamza"

// Check if a key exists
const exists = await Prefs.contains('username');
console.log('Contains username?', exists);

// Set multiple keys
await Prefs.setMultiple({ theme: 'dark', lang: 'en' });

// Get all keys
const all = await Prefs.getAll();
console.log(all);

// Clear everything
await Prefs.clearAll();
}

🛠 Example App

A full interactive playground is in example/App.tsx.

Run it locally:

cd example
yarn install
yarn start

📌 Platform Notes
iOS

Values stored in NSUserDefaults.

Use an App Group ID in setName to share data with extensions/widgets.

Only property list types are supported natively, but this API exposes string values for consistency.

Android

Values stored in SharedPreferences.

setName changes the XML file used for storage.

Only string values are exposed through this API.

🧑‍💻 Contributing

Pull requests are welcome!

Fork the repo

Create a new branch: git checkout -b feature/your-feature

Commit changes & push

Open a PR on GitHub

📄 License

MIT © 2025 hamzamekk
