import TurboPreferences from './NativeTurboPreferences';

export function setName(name: string | null): Promise<void> {
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

export function reloadWidgets(kind?: string): Promise<void> {
  return TurboPreferences.reloadWidgets(kind ?? null);
}

export function setBoolean(key: string, value: boolean): Promise<void> {
  return TurboPreferences.setBoolean(key, value);
}

export function getBoolean(key: string): Promise<boolean | null> {
  return TurboPreferences.getBoolean(key);
}

export function setInt(key: string, value: number): Promise<void> {
  if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
    return Promise.reject(
      new TypeError(
        `setInt expects a 32-bit integer, got ${value}. Use setDouble for other numbers.`
      )
    );
  }
  return TurboPreferences.setInt(key, value);
}

export function getInt(key: string): Promise<number | null> {
  return TurboPreferences.getInt(key);
}

export function setDouble(key: string, value: number): Promise<void> {
  return TurboPreferences.setDouble(key, value);
}

export function getDouble(key: string): Promise<number | null> {
  return TurboPreferences.getDouble(key);
}

// Export hooks
export * from './hooks';

export default TurboPreferences;
