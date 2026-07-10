import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';

/**
 * React hook for managing an object preference with JSON serialization
 *
 * @param key - The preference key
 * @returns [value, setValue, contains, clear]
 *
 * @example
 * ```tsx
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * function UserProfile() {
 *   const [user, setUser, hasUser, clearUser] = usePreferenceObject<User>('user');
 *
 *   return (
 *     <View>
 *       <Text>Name: {user?.name ?? 'Unknown'}</Text>
 *       <Text>Age: {user?.age ?? 'Unknown'}</Text>
 *       <Button
 *         title="Set John"
 *         onPress={() => setUser({ name: 'John', age: 25 })}
 *       />
 *       <Button title="Clear" onPress={clearUser} />
 *     </View>
 *   );
 * }
 * ```
 */
export function usePreferenceObject<T>(
  key: string
): [T | null, (value: T) => Promise<void>, boolean, () => Promise<void>] {
  const [value, setValue] = useState<T | null>(null);
  const [contains, setContains] = useState<boolean>(false);

  const setPreferenceValue = useCallback(
    async (newValue: T) => {
      if (!key) return;

      try {
        // Convert object to JSON string for storage
        const jsonString = JSON.stringify(newValue);
        await TurboPreferences.set(key, jsonString);
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceObject setValue error:', error);
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
      console.warn('usePreferenceObject clear error:', error);
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
          try {
            // Parse JSON string back to object
            const parsedValue = JSON.parse(currentValue) as T;
            setValue(parsedValue);
          } catch (parseError) {
            console.warn('usePreferenceObject parse error:', parseError);
            setValue(null); // Invalid JSON
          }
        } else {
          setValue(null);
        }
        setContains(exists);
      } catch (error) {
        console.warn('usePreferenceObject load error:', error);
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
