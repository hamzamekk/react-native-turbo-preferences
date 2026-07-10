import type { EventSubscription } from 'react-native';
import TurboPreferences from './NativeTurboPreferences';
import type { PreferenceChangeEvent } from './NativeTurboPreferences';

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

/** Native resolve(nil) can surface as undefined — honor the declared `T | null`. */
export function nullify<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

export function validateInt(value: number): Promise<void> | null {
  if (!Number.isInteger(value) || value < INT32_MIN || value > INT32_MAX) {
    return Promise.reject(
      new TypeError(
        `setInt expects a 32-bit integer, got ${value}. Use setDouble for other numbers.`
      )
    );
  }
  return null;
}

/**
 * A handle to one preference store — the default store, a named file,
 * or an iOS App Group container. Multiple stores can be used at the
 * same time; handles are cheap JS objects and can be created freely.
 */
export interface PreferenceStore {
  /** The suite/file name, or null for the default store. */
  readonly name: string | null;

  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  clear(key: string): Promise<void>;
  contains(key: string): Promise<boolean>;

  setBoolean(key: string, value: boolean): Promise<void>;
  getBoolean(key: string): Promise<boolean | null>;
  setInt(key: string, value: number): Promise<void>;
  getInt(key: string): Promise<number | null>;
  setDouble(key: string, value: number): Promise<void>;
  getDouble(key: string): Promise<number | null>;

  setMultiple(values: { key: string; value: string }[]): Promise<void>;
  getMultiple(keys: string[]): Promise<{ [key: string]: string | null }>;
  clearMultiple(keys: string[]): Promise<void>;

  getAll(): Promise<{ [key: string]: string }>;
  clearAll(): Promise<void>;

  /** Fires only for changes in this store. */
  addListener(
    listener: (event: PreferenceChangeEvent) => void
  ): EventSubscription;
}

/**
 * Create a handle to a preference store.
 *
 * @param name - iOS: UserDefaults suite (e.g. an App Group like
 * `group.com.yourcompany.yourapp`). Android: SharedPreferences file
 * name. Omit for the default store.
 *
 * @example
 * ```ts
 * const appGroup = createStore('group.com.yourcompany.yourapp');
 * await appGroup.setInt('streak', 42);
 *
 * const defaults = createStore();
 * await defaults.set('theme', 'dark');
 * ```
 */
export function createStore(name?: string | null): PreferenceStore {
  const storeName = name && name.length > 0 ? name : null;

  return {
    name: storeName,

    get: (key) => TurboPreferences.get(storeName, key).then(nullify),
    set: (key, value) => TurboPreferences.set(storeName, key, value),
    clear: (key) => TurboPreferences.clear(storeName, key),
    contains: (key) => TurboPreferences.contains(storeName, key),

    setBoolean: (key, value) =>
      TurboPreferences.setBoolean(storeName, key, value),
    getBoolean: (key) =>
      TurboPreferences.getBoolean(storeName, key).then(nullify),
    setInt: (key, value) =>
      validateInt(value) ?? TurboPreferences.setInt(storeName, key, value),
    getInt: (key) => TurboPreferences.getInt(storeName, key).then(nullify),
    setDouble: (key, value) =>
      TurboPreferences.setDouble(storeName, key, value),
    getDouble: (key) =>
      TurboPreferences.getDouble(storeName, key).then(nullify),

    setMultiple: (values) => TurboPreferences.setMultiple(storeName, values),
    getMultiple: (keys) => TurboPreferences.getMultiple(storeName, keys),
    clearMultiple: (keys) => TurboPreferences.clearMultiple(storeName, keys),

    getAll: () => TurboPreferences.getAll(storeName),
    clearAll: () => TurboPreferences.clearAll(storeName),

    addListener: (listener) =>
      TurboPreferences.onPreferenceChange((event) => {
        if ((event.store ?? null) === storeName) {
          listener(event);
        }
      }),
  };
}
