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
};

export interface Spec extends TurboModule {
  // ----- Namespace / file selection -----
  /**
   * iOS: UserDefaults(suiteName)
   * Android: getSharedPreferences(name, MODE_PRIVATE)
   * Pass undefined/null to go back to the standard/default file.
   */
  setName(name: string | null): Promise<void>;

  // ----- Single key ops -----
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  clear(key: string): Promise<void>;
  contains(key: string): Promise<boolean>; // aka hasKey

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
  setBoolean(key: string, value: boolean): Promise<void>;
  getBoolean(key: string): Promise<boolean | null>;
  setInt(key: string, value: Int32): Promise<void>;
  getInt(key: string): Promise<number | null>;
  setDouble(key: string, value: number): Promise<void>;
  getDouble(key: string): Promise<number | null>;

  // ----- Batch ops -----
  setMultiple(values: { key: string; value: string }[]): Promise<void>;
  getMultiple(keys: string[]): Promise<{ [key: string]: string | null }>;
  clearMultiple(keys: string[]): Promise<void>;

  // ----- Whole-store ops -----
  getAll(): Promise<{ [key: string]: string }>;
  clearAll(): Promise<void>;

  // ----- Change events -----
  /**
   * Fires when a value in the current store changes — including writes
   * made by native code (widgets, SDKs), not just through this module.
   * iOS: NSUserDefaultsDidChangeNotification (in-process changes) diffed
   * against a snapshot of the store.
   * Android: SharedPreferences.OnSharedPreferenceChangeListener.
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
