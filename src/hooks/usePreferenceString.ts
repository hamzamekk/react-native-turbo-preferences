import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';
import { getCurrentName } from '../currentStore';
import type { PreferenceStore } from '../store';

/**
 * Simple React hook for managing a string preference
 *
 * @param key - The preference key
 * @param store - Optional store handle from createStore(); defaults to
 * the store selected by the global API
 * @returns [value, setValue, contains, clear]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [value, setValue, contains, clear] = usePreferenceString('username');
 *
 *   return (
 *     <View>
 *       <Text>Username: {value || 'Not set'}</Text>
 *       <Button title="Set to John" onPress={() => setValue('John')} />
 *       <Button title="Clear" onPress={clear} />
 *     </View>
 *   );
 * }
 * ```
 */
export function usePreferenceString(
  key: string,
  store?: PreferenceStore
): [
  string | null,
  (value: string) => Promise<void>,
  boolean,
  () => Promise<void>,
] {
  const [value, setValue] = useState<string | null>(null);
  const [contains, setContains] = useState<boolean>(false);
  const storeName = store ? store.name : undefined;

  const setPreferenceValue = useCallback(
    async (newValue: string) => {
      if (!key) return;

      try {
        const name = storeName !== undefined ? storeName : getCurrentName();
        await TurboPreferences.set(name, key, newValue);
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceString setValue error:', error);
        throw error;
      }
    },
    [key, storeName]
  );

  const clearPreferenceValue = useCallback(async () => {
    if (!key) return;

    try {
      const name = storeName !== undefined ? storeName : getCurrentName();
      await TurboPreferences.clear(name, key);
      setValue(null);
      setContains(false);
    } catch (error) {
      console.warn('usePreferenceString clear error:', error);
      throw error;
    }
  }, [key, storeName]);

  // Load on mount/key change, and reload when the store changes —
  // including writes from other components or native code
  useEffect(() => {
    if (!key) return;
    let active = true;

    const resolveName = () =>
      storeName !== undefined ? storeName : getCurrentName();

    const load = async () => {
      try {
        const name = resolveName();
        const [currentValue, exists] = await Promise.all([
          TurboPreferences.get(name, key),
          TurboPreferences.contains(name, key),
        ]);
        if (!active) return;
        setValue(currentValue);
        setContains(exists);
      } catch (error) {
        console.warn('usePreferenceString load error:', error);
      }
    };

    load();
    const subscription = TurboPreferences.onPreferenceChange((event) => {
      if ((event.store ?? null) !== resolveName()) return;
      if (event.key == null || event.key === key) load();
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [key, storeName]);

  return [value, setPreferenceValue, contains, clearPreferenceValue];
}
