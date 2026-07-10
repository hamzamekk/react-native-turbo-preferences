import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';
import { getCurrentName } from '../currentStore';
import type { PreferenceStore } from '../store';

/**
 * React hook for managing an object preference with JSON serialization
 *
 * @param key - The preference key
 * @param store - Optional store handle from createStore(); defaults to
 * the store selected by the global API
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
  key: string,
  store?: PreferenceStore
): [T | null, (value: T) => Promise<void>, boolean, () => Promise<void>] {
  const [value, setValue] = useState<T | null>(null);
  const [contains, setContains] = useState<boolean>(false);
  const storeName = store ? store.name : undefined;

  const setPreferenceValue = useCallback(
    async (newValue: T) => {
      if (!key) return;

      try {
        const name = storeName !== undefined ? storeName : getCurrentName();
        // Convert object to JSON string for storage
        const jsonString = JSON.stringify(newValue);
        await TurboPreferences.set(name, key, jsonString);
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceObject setValue error:', error);
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
      console.warn('usePreferenceObject clear error:', error);
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
