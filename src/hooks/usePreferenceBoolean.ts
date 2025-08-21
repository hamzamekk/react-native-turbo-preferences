import { useState, useCallback, useEffect } from 'react';
import TurboPreferences from '../NativeTurboPreferences';

/**
 * React hook for managing a boolean preference
 *
 * @param key - The preference key
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
  key: string
): [
  boolean | null,
  (value: boolean) => Promise<void>,
  boolean,
  () => Promise<void>,
] {
  const [value, setValue] = useState<boolean | null>(null);
  const [contains, setContains] = useState<boolean>(false);

  const setPreferenceValue = useCallback(
    async (newValue: boolean) => {
      if (!key) return;

      try {
        // Convert boolean to string for storage
        await TurboPreferences.set(key, String(newValue));
        setValue(newValue);
        setContains(true);
      } catch (error) {
        console.warn('usePreferenceBoolean setValue error:', error);
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
      console.warn('usePreferenceBoolean clear error:', error);
      throw error;
    }
  }, [key]);

  // Load initial value on mount and key change
  useEffect(() => {
    if (!key) return;

    const loadInitialValue = async () => {
      try {
        const [currentValue, exists] = await Promise.all([
          TurboPreferences.get(key),
          TurboPreferences.contains(key),
        ]);

        if (currentValue !== null) {
          // Parse boolean from string - handle various boolean representations
          const lowerValue = currentValue.toLowerCase();
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

    loadInitialValue();
  }, [key]);

  return [value, setPreferenceValue, contains, clearPreferenceValue];
}
