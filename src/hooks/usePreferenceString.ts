import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';

/**
 * Simple React hook for managing a string preference
 *
 * @param key - The preference key
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
  key: string
): [
  string | null,
  (value: string) => Promise<void>,
  boolean,
  () => Promise<void>,
] {
  const [value, setValue] = useState<string | null>(null);
  const [contains, setContains] = useState<boolean>(false);

  const setPreferenceValue = useCallback(
    async (newValue: string) => {
      if (!key) return;

      try {
        await TurboPreferences.set(key, newValue);
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceString setValue error:', error);
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
      console.warn('usePreferenceString clear error:', error);
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
        setValue(currentValue);
        setContains(exists);
      } catch (error) {
        console.warn('usePreferenceString load error:', error);
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
