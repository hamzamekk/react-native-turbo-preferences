import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

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

  // ----- Batch ops -----
  setMultiple(values: { key: string; value: string }[]): Promise<void>;
  getMultiple(keys: string[]): Promise<{ [key: string]: string | null }>;
  clearMultiple(keys: string[]): Promise<void>;

  // ----- Whole-store ops -----
  getAll(): Promise<{ [key: string]: string }>;
  clearAll(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TurboPreferences');
