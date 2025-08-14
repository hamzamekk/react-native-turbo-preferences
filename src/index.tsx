import TurboPreferences from './NativeTurboPreferences';

export function multiply(a: number, b: number): number {
  return TurboPreferences.multiply(a, b);
}

export function setName(name: string): void {
  TurboPreferences.setName(name);
}

export function get(key: string): Promise<string | null> {
  return TurboPreferences.get(key);
}

export function set(key: string, value: string): void {
  TurboPreferences.set(key, value);
}
