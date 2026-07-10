import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';
import { getCurrentName } from '../currentStore';
import type { PreferenceStore } from '../store';

/**
 * React hook for managing a boolean preference
 *
 * @param key - The preference key
 * @param store - Optional store handle from createStore(); defaults to
 * the store selected by the global API
 * @returns [value, setValue, contains, clear]
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const [enabled, setEnabled, hasEnabled, clearEnabled] = usePreferenceBoolean('notifications');
 *
 *   return (
 *     <View>
 *       <Text>Notifications: {enabled ? 'ON' : 'OFF'}</Text>
 *       <Button title="Toggle" onPress={() => setEnabled(!enabled)} />
 *       <Button title="Clear" onPress={clearEnabled} />
 *     </View>
 *   );
 * }
 * ```
 */
export function usePreferenceBoolean(
  key: string,
  store?: PreferenceStore
): [
  boolean | null,
  (value: boolean) => Promise<void>,
  boolean,
  () => Promise<void>,
] {
  const [value, setValue] = useState<boolean | null>(null);
  const [contains, setContains] = useState<boolean>(false);
  const storeName = store ? store.name : undefined;

  const setPreferenceValue = useCallback(
    async (newValue: boolean) => {
      if (!key) return;

      try {
        const name = storeName !== undefined ? storeName : getCurrentName();
        // Convert boolean to string for storage
        await TurboPreferences.set(name, key, String(newValue));
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceBoolean setValue error:', error);
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
      console.warn('usePreferenceBoolean clear error:', error);
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

        if (currentValue !== null) {
          // Parse boolean from string - handle various boolean representations
          const lowerValue = currentValue?.toLowerCase();
          if (lowerValue === 'true' || lowerValue === '1') {
            setValue(true);
          } else if (lowerValue === 'false' || lowerValue === '0') {
            setValue(false);
          } else {
            setValue(null); // Invalid boolean value
          }
        } else {
          setValue(null);
        }
        setContains(exists);
      } catch (error) {
        console.warn('usePreferenceBoolean load error:', error);
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
