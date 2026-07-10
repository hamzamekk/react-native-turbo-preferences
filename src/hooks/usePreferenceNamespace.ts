import { useState, useCallback } from 'react';
import { getCurrentName, setCurrentName } from '../currentStore';

/**
 * React hook for managing the global preference namespace.
 *
 * @deprecated Prefer `createStore(name)` — hold one handle per store
 * instead of switching a global. This hook drives the same global
 * "current store" as the deprecated `setName()`.
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
  const [currentNamespace, setCurrentNamespace] = useState<string>(
    () => getCurrentName() ?? ''
  );

  const setNamespace = useCallback(async (namespace: string) => {
    setCurrentName(namespace);
    setCurrentNamespace(namespace);
  }, []);

  const resetToDefault = useCallback(async () => {
    setCurrentName(null);
    setCurrentNamespace('');
  }, []);

  return [currentNamespace, setNamespace, resetToDefault];
}
