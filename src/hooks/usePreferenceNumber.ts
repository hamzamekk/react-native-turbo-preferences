import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';

/**
 * React hook for managing a number preference
 *
 * @param key - The preference key
 * @returns [value, setValue, contains, clear]
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount, hasCount, clearCount] = usePreferenceNumber('count');
 *
 *   return (
 *     <View>
 *       <Text>Count: {count ?? 0}</Text>
 *       <Button title="+1" onPress={() => setCount((count ?? 0) + 1)} />
 *       <Button title="Clear" onPress={clearCount} />
 *     </View>
 *   );
 * }
 * ```
 */
export function usePreferenceNumber(
  key: string
): [
  number | null,
  (value: number) => Promise<void>,
  boolean,
  () => Promise<void>,
] {
  const [value, setValue] = useState<number | null>(null);
  const [contains, setContains] = useState<boolean>(false);

  const setPreferenceValue = useCallback(
    async (newValue: number) => {
      if (!key) return;

      try {
        // Convert number to string for storage
        await TurboPreferences.set(key, String(newValue));
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceNumber setValue error:', error);
        throw error;
      }
    },
    [key]
  );

  const clearPreferenceValue = useCallback(async () => {
    if (!key) return;

    try {
      await TurboPreferences.clear(key);
      setValue(null);
      setContains(false);
    } catch (error) {
      console.warn('usePreferenceNumber clear error:', error);
      throw error;
    }
  }, [key]);

  // Load on mount/key change, and reload when the store changes —
  // including writes from other components or native code
  useEffect(() => {
    if (!key) return;
    let active = true;

    const load = async () => {
      try {
        const [currentValue, exists] = await Promise.all([
          TurboPreferences.get(key),
          TurboPreferences.contains(key),
        ]);
        if (!active) return;

        if (currentValue !== null) {
          const numValue = Number(currentValue);
          // Check if it's a valid number
          setValue(isNaN(numValue) ? null : numValue);
        } else {
          setValue(null);
        }
        setContains(exists);
      } catch (error) {
        console.warn('usePreferenceNumber load error:', error);
      }
    };

    load();
    const subscription = TurboPreferences.onPreferenceChange((event) => {
      if (event.key == null || event.key === key) load();
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [key]);

  return [value, setPreferenceValue, contains, clearPreferenceValue];
}
