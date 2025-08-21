import { useState, useCallback } from 'react';
import TurboPreferences from '../NativeTurboPreferences';

/**
 * React hook for managing preference namespaces
 *
 * @returns [currentNamespace, setNamespace, resetToDefault]
 *
 * @example
 * ```tsx
 * function UserSwitcher() {
 *   const [namespace, setNamespace, resetToDefault] = usePreferenceNamespace();
 *   const [username, setUsername] = usePreferenceString('username');
 *
 *   return (
 *     <View>
 *       <Text>Context: {namespace || '(default)'}</Text>
 *       <Text>Username: {username}</Text>
 *       <Button title="User 123" onPress={() => setNamespace('user_123')} />
 *       <Button title="Default" onPress={resetToDefault} />
 *     </View>
 *   );
 * }
 * ```
 */
export function usePreferenceNamespace(): [
  string,
  (namespace: string) => Promise<void>,
  () => Promise<void>,
] {
  const [currentNamespace, setCurrentNamespace] = useState<string>('');

  const setNamespace = useCallback(async (namespace: string) => {
    try {
      await TurboPreferences.setName(namespace);
      setCurrentNamespace(namespace);
    } catch (error) {
      console.warn('usePreferenceNamespace setNamespace error:', error);
      throw error;
    }
  }, []);

  const resetToDefault = useCallback(async () => {
    try {
      // Pass null to go back to default namespace
      await TurboPreferences.setName(null);
      setCurrentNamespace('');
    } catch (error) {
      console.warn('usePreferenceNamespace resetToDefault error:', error);
      throw error;
    }
  }, []);

  return [currentNamespace, setNamespace, resetToDefault];
}
