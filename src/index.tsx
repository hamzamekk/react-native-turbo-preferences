import type { EventSubscription } from 'react-native';
import TurboPreferences from './NativeTurboPreferences';
import type { PreferenceChangeEvent } from './NativeTurboPreferences';
import { getCurrentName, setCurrentName } from './currentStore';
import { createStore, nullify, validateInt } from './store';
import type { PreferenceStore } from './store';

export type { PreferenceChangeEvent, PreferenceStore };
export { createStore };

/**
 * Subscribe to changes across all stores this module has touched —
 * fires for writes made through this module and by native code
 * (widgets, SDKs). `event.store` says which store changed; use
 * `store.addListener()` for a single store.
 */
export function addPreferenceChangeListener(
  listener: (event: PreferenceChangeEvent) => void
): EventSubscription {
  return TurboPreferences.onPreferenceChange(listener);
}

export function reloadWidgets(kind?: string): Promise<void> {
  return TurboPreferences.reloadWidgets(kind ?? null);
}

// ---------------------------------------------------------------------------
// Global-namespace API. These route through a module-level "current store"
// selected with setName; prefer createStore() and one handle per store.
// ---------------------------------------------------------------------------

/** The store name the global API currently points at (null = default). */
export function getCurrentStoreName(): string | null {
  return getCurrentName();
}

/**
 * @deprecated Use `createStore(name)` and keep a handle instead —
 * setName switches a global that every call in your app shares.
 * Note: the selection lives in JS and resets on app restart (this was
 * already Android's behavior; iOS used to persist it across launches).
 */
export function setName(name: string | null): Promise<void> {
  setCurrentName(name);
  return Promise.resolve();
}

export function get(key: string): Promise<string | null> {
  return TurboPreferences.get(getCurrentName(), key).then(nullify);
}

export function getAll(): Promise<{ [key: string]: string } | null> {
  return TurboPreferences.getAll(getCurrentName());
}

export function set(key: string, value: string): Promise<void> {
  return TurboPreferences.set(getCurrentName(), key, value);
}

export function clear(key: string): Promise<void> {
  return TurboPreferences.clear(getCurrentName(), key);
}

export function clearAll(): Promise<void> {
  return TurboPreferences.clearAll(getCurrentName());
}

export function setMultiple(
  values: { key: string; value: string }[]
): Promise<void> {
  return TurboPreferences.setMultiple(getCurrentName(), values);
}

export function getMultiple(
  keys: string[]
): Promise<{ [key: string]: string | null }> {
  return TurboPreferences.getMultiple(getCurrentName(), keys);
}

export function clearMultiple(keys: string[]): Promise<void> {
  return TurboPreferences.clearMultiple(getCurrentName(), keys);
}

export function contains(key: string): Promise<boolean> {
  return TurboPreferences.contains(getCurrentName(), key);
}

export function setBoolean(key: string, value: boolean): Promise<void> {
  return TurboPreferences.setBoolean(getCurrentName(), key, value);
}

export function getBoolean(key: string): Promise<boolean | null> {
  return TurboPreferences.getBoolean(getCurrentName(), key).then(nullify);
}

export function setInt(key: string, value: number): Promise<void> {
  return (
    validateInt(value) ?? TurboPreferences.setInt(getCurrentName(), key, value)
  );
}

export function getInt(key: string): Promise<number | null> {
  return TurboPreferences.getInt(getCurrentName(), key).then(nullify);
}

export function setDouble(key: string, value: number): Promise<void> {
  return TurboPreferences.setDouble(getCurrentName(), key, value);
}

export function getDouble(key: string): Promise<number | null> {
  return TurboPreferences.getDouble(getCurrentName(), key).then(nullify);
}

// Export hooks
export * from './hooks';

/**
 * Default export mirrors the named functions (NOT the raw native
 * module — its methods take a store name as the first argument).
 */
export default {
  createStore,
  addPreferenceChangeListener,
  reloadWidgets,
  getCurrentStoreName,
  setName,
  get,
  getAll,
  set,
  clear,
  clearAll,
  setMultiple,
  getMultiple,
  clearMultiple,
  contains,
  setBoolean,
  getBoolean,
  setInt,
  getInt,
  setDouble,
  getDouble,
};
