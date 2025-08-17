# React Native Turbo Preferences

[![npm version](https://badge.fury.io/js/react-native-turbo-preferences.svg)](https://badge.fury.io/js/react-native-turbo-preferences)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/hamzamekk/react-native-turbo-preferences/workflows/CI/badge.svg)](https://github.com/hamzamekk/react-native-turbo-preferences/actions)
[![React Native](https://img.shields.io/badge/React%20Native-0.79+-blue.svg)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

> ⚡ A fast, cross-platform TurboModule for app preferences and key-value storage, using NSUserDefaults on iOS and SharedPreferences on Android. Built for React Native's New Architecture.

## 🌟 Features

- 🚀 **New Architecture Ready** — Implemented as a TurboModule for maximum performance
- 📱 **Cross-Platform** — Same JS API for iOS + Android with native optimizations
- 📦 **Lightweight** — Wraps native APIs (NSUserDefaults, SharedPreferences) directly
- 🗂 **Namespace Support** — Switch between default store and named suite/file
- 🛠 **Batch Operations** — Set/get/remove multiple keys at once for efficiency
- 🧹 **Full Control** — Get all keys, clear store, check existence
- 🔒 **Type Safe** — Full TypeScript support with proper type definitions
- ⚡ **Turbo Performance** — Built for React Native's New Architecture

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

## 🎯 Usage Examples

### Example 1: User Settings

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
- ✅ Namespace switching
- ✅ Batch operations
- ✅ Error handling
- ✅ Real-time updates

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

| Operation        | iOS | Android | Notes                     |
| ---------------- | --- | ------- | ------------------------- |
| Single Set (100) | TBD | 232ms   | 431 ops/sec               |
| Single Get (100) | TBD | 100ms   | 995 ops/sec               |
| Batch Set (100)  | TBD | 9ms     | 11,700 ops/sec            |
| Batch Get (100)  | TBD | 6ms     | 18,000 ops/sec            |
| Namespace Switch | TBD | 77ms    | 646 ops/sec               |
| Memory overhead  | TBD | ~12KB   | **0.12 KB per operation** |

> **Note:** iOS benchmarks coming soon. Android results from real device testing.

### 📊 Memory Footprint Analysis

**Android Memory Testing Results (Real Device):**

| Test Type        | Operations | Memory Used | Memory per Operation | Notes                                 |
| ---------------- | ---------- | ----------- | -------------------- | ------------------------------------- |
| **Regular Test** | 100        | 12 KB       | 0.12 KB              | Efficient memory usage                |
| **Stress Test**  | 1,000      | 96 KB       | 0.096 KB             | Scales linearly, excellent efficiency |

**Key Findings:**

- **Ultra-low memory overhead**: Only **0.12 KB per operation** (100 ops = 12 KB total)
- **Excellent scalability**: **0.096 KB per operation** at scale (1000 ops = 96 KB total)
- **Linear memory scaling**: Memory usage grows predictably: **12 KB → 96 KB** (8x operations = 8x memory)
- **Production efficiency**: **96 KB for 1000 operations** - suitable for high-frequency apps
- **Memory consistency**: **13 KB baseline overhead** maintained across all operations

> **Memory testing performed on Samsung SM-A525F (Android 14) with real device benchmarks.**

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
- [x] ✅ Performance monitoring & benchmarking
- [x] ✅ Memory footprint analysis
- [ ] 🔄 React hooks (In Progress)
- [ ] 📅 iOS benchmarks

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
<summary><strong>How do I handle errors?</strong></summary>

Use try-catch blocks with async/await:

```typescript
try {
  await Prefs.set('key', 'value');
} catch (error) {
  console.error('Error saving preference:', error.message);
  // Handle error appropriately
}
```

</details>

<details>
<summary><strong>Can I use this in production?</strong></strong></summary>

Yes! This package is production-ready and follows React Native best practices. Make sure to:

- Set up proper error handling
- Use appropriate namespaces for data organization
- Monitor performance in production
- Test on both platforms thoroughly
</details>

<details>
<details>
<summary><strong>Why TurboModule instead of regular Native Module?</strong></summary>

TurboModules provide:

- Better performance with New Architecture
- Automatic code generation
- Type safety improvements
- Future-proof architecture
- Better integration with React Native's evolving ecosystem
</details>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Thanks to the React Native team for the New Architecture
- Inspired by the need for better performance in React Native apps
- Built with modern TypeScript and React Native best practices

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/hamzamekk/react-native-turbo-preferences/issues)
- 📖 **Documentation:** [Full API Docs](https://github.com/hamzamekk/react-native-turbo-preferences#readme)
- 🌟 **Star this repo** if you found it helpful!
- 💬 **Discussions:** [GitHub Discussions](https://github.com/hamzamekk/react-native-turbo-preferences/discussions)

---

<div align="center">

**[⬆ Back to Top](#react-native-turbo-preferences)**

Made with ❤️ by [hamzamekk](https://github.com/hamzamekk)

</div>
