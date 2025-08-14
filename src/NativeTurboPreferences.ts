import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  setName(name: string): void;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): void;
  clear(key: string): void;
  clearAll(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TurboPreferences');
