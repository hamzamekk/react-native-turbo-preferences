import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type {
  EventEmitter,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

export type PreferenceChangeEvent = {
  /**
   * The key that changed. Null when the whole store changed at once
   * (e.g. clearAll) — re-read anything you care about.
   */
  key?: string | null;
  /**
   * The store the change happened in: the suite/file name, or null for
   * the default store.
   */
  store?: string | null;
};

/**
 * Every method takes the store name as its first argument so the native
 * layer stays stateless — pass null for the default store.
 * iOS: UserDefaults(suiteName: name) / standardUserDefaults.
 * Android: getSharedPreferences(name, MODE_PRIVATE) / the "default" file.
 *
 * JS-side store handles (createStore) and the deprecated setName shim
 * both route through these.
 */
export interface Spec extends TurboModule {
  // ----- Single key ops -----
  get(name: string | null, key: string): Promise<string | null>;
  set(name: string | null, key: string, value: string): Promise<void>;
  clear(name: string | null, key: string): Promise<void>;
  contains(name: string | null, key: string): Promise<boolean>; // aka hasKey

  // ----- Typed ops -----
  /**
   * Stored as real native types so native readers (widgets, watch apps,
   * SDKs) get them without string parsing:
   * iOS: setBool/setInteger/setDouble on NSUserDefaults.
   * Android: putBoolean/putInt/putFloat on SharedPreferences
   * (double is stored as Float — Android has no putDouble).
   * Typed getters resolve null when the key is missing or holds an
   * incompatible type.
   */
  setBoolean(name: string | null, key: string, value: boolean): Promise<void>;
  getBoolean(name: string | null, key: string): Promise<boolean | null>;
  setInt(name: string | null, key: string, value: Int32): Promise<void>;
  getInt(name: string | null, key: string): Promise<number | null>;
  setDouble(name: string | null, key: string, value: number): Promise<void>;
  getDouble(name: string | null, key: string): Promise<number | null>;

  // ----- Batch ops -----
  setMultiple(
    name: string | null,
    values: { key: string; value: string }[]
  ): Promise<void>;
  getMultiple(
    name: string | null,
    keys: string[]
  ): Promise<{ [key: string]: string | null }>;
  clearMultiple(name: string | null, keys: string[]): Promise<void>;

  // ----- Whole-store ops -----
  getAll(name: string | null): Promise<{ [key: string]: string }>;
  clearAll(name: string | null): Promise<void>;

  // ----- Change events -----
  /**
   * Fires when a value changes in any store this module has touched —
   * including writes made by native code (widgets, SDKs), not just
   * through this module.
   * iOS: NSUserDefaultsDidChangeNotification (in-process changes) diffed
   * against per-store snapshots.
   * Android: SharedPreferences.OnSharedPreferenceChangeListener per store.
   */
  readonly onPreferenceChange: EventEmitter<PreferenceChangeEvent>;

  // ----- Widgets -----
  /**
   * iOS: WidgetCenter.shared.reloadAllTimelines(), or
   * reloadTimelines(ofKind:) when a kind is passed.
   * Android: broadcasts ACTION_APPWIDGET_UPDATE to the app's widget
   * providers (kind is ignored).
   */
  reloadWidgets(kind?: string | null): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TurboPreferences');
