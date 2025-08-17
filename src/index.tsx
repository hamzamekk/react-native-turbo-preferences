import TurboPreferences from './NativeTurboPreferences';

export function setName(name: string): Promise<void> {
  return TurboPreferences.setName(name);
}

export function get(key: string): Promise<string | null> {
  return TurboPreferences.get(key);
}

export function getAll(): Promise<{ [key: string]: string } | null> {
  return TurboPreferences.getAll();
}

export function set(key: string, value: string): Promise<void> {
  return TurboPreferences.set(key, value);
}

export function clear(key: string): Promise<void> {
  return TurboPreferences.clear(key);
}

export function clearAll(): Promise<void> {
  return TurboPreferences.clearAll();
}

export function setMultiple(
  values: { key: string; value: string }[]
): Promise<void> {
  return TurboPreferences.setMultiple(values);
}

export function getMultiple(
  keys: string[]
): Promise<{ [key: string]: string | null }> {
  return TurboPreferences.getMultiple(keys);
}

export function clearMultiple(keys: string[]): Promise<void> {
  return TurboPreferences.clearMultiple(keys);
}

export function contains(key: string): Promise<boolean> {
  return TurboPreferences.contains(key);
}

export default TurboPreferences;
