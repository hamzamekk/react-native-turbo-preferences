import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // ----- Namespace / file selection -----
  /**
   * iOS: UserDefaults(suiteName)
   * Android: getSharedPreferences(name, MODE_PRIVATE)
   * Pass undefined/null to go back to the standard/default file.
   */
  setName(name: string): void;

  // ----- Single key ops -----
  get(key: string): Promise<string | null>;
  set(key: string, value: string): void;
  clear(key: string): void;
  contains(key: string): Promise<boolean>; // aka hasKey

  // ----- Batch ops -----
  setMultiple(values: { key: string; value: string }[]): void;

  // ----- Whole-store ops -----
  getAll(): Promise<{ [key: string]: string }>;
  clearAll(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TurboPreferences');
