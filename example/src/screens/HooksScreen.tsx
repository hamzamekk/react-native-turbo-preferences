import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {
  usePreferenceString,
  usePreferenceNumber,
  usePreferenceBoolean,
  usePreferenceObject,
  usePreferenceNamespace,
} from 'react-native-turbo-preferences';

const Button = ({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    style={[styles.btn, disabled && styles.btnDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.btnText}>{title}</Text>
  </Pressable>
);

interface User {
  name: string;
  age: number;
  email: string;
}

export default function HooksScreen() {
  // Namespace hook
  const [namespace, setNamespace, resetToDefault] = usePreferenceNamespace();

  // String hook
  const [username, setUsername, hasUsername, clearUsername] =
    usePreferenceString('username');

  // Number hook
  const [count, setCount, hasCount, clearCount] = usePreferenceNumber('count');

  // Boolean hook
  const [
    notifications,
    setNotifications,
    hasNotifications,
    clearNotifications,
  ] = usePreferenceBoolean('notifications');

  // Object hook
  const [user, setUser, hasUser, clearUser] = usePreferenceObject<User>('user');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>React Hooks API</Text>
          <Text style={styles.subtitle}>
            Platform: {Platform.OS} • Namespace:{' '}
            <Text style={styles.ns}>{namespace || '(default)'}</Text>
          </Text>
        </View>

        {/* Namespace Hook */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏷️ Namespace Hook</Text>
          <Text style={styles.code}>
            const [namespace, setNamespace, resetToDefault] =
            usePreferenceNamespace()
          </Text>
          <View style={styles.row}>
            <Button title="User 123" onPress={() => setNamespace('user_123')} />
            <View style={{ width: 8 }} />
            <Button
              title="Settings"
              onPress={() => setNamespace('app_settings')}
            />
            <View style={{ width: 8 }} />
            <Button title="Default" onPress={resetToDefault} />
          </View>
          <Text style={styles.caption}>
            Current: <Text style={styles.mono}>{namespace || '(default)'}</Text>
          </Text>
        </View>

        {/* String Hook */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 String Hook</Text>
          <Text style={styles.code}>
            const [username, setUsername, hasUsername, clearUsername] =
            usePreferenceString('username')
          </Text>
          <View style={styles.row}>
            <Button title="Set John" onPress={() => setUsername('John')} />
            <View style={{ width: 8 }} />
            <Button title="Set Jane" onPress={() => setUsername('Jane')} />
            <View style={{ width: 8 }} />
            <Button title="Clear" onPress={clearUsername} />
          </View>
          <Text style={styles.caption}>
            Value: <Text style={styles.mono}>{username ?? 'null'}</Text> |
            Exists:{' '}
            <Text style={styles.mono}>{hasUsername ? 'true' : 'false'}</Text>
          </Text>
        </View>

        {/* Number Hook */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔢 Number Hook</Text>
          <Text style={styles.code}>
            const [count, setCount, hasCount, clearCount] =
            usePreferenceNumber('count')
          </Text>
          <View style={styles.row}>
            <Button title="+1" onPress={() => setCount((count ?? 0) + 1)} />
            <View style={{ width: 8 }} />
            <Button title="+10" onPress={() => setCount((count ?? 0) + 10)} />
            <View style={{ width: 8 }} />
            <Button title="Reset" onPress={() => setCount(0)} />
            <View style={{ width: 8 }} />
            <Button title="Clear" onPress={clearCount} />
          </View>
          <Text style={styles.caption}>
            Value: <Text style={styles.mono}>{count ?? 'null'}</Text> | Exists:{' '}
            <Text style={styles.mono}>{hasCount ? 'true' : 'false'}</Text>
          </Text>
        </View>

        {/* Boolean Hook */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>✅ Boolean Hook</Text>
          <Text style={styles.code}>
            const [notifications, setNotifications, hasNotifications,
            clearNotifications] = {'\n'}
            {'  '}usePreferenceBoolean('notifications')
          </Text>
          <View style={styles.row}>
            <Button
              title={`Turn ${notifications ? 'OFF' : 'ON'}`}
              onPress={() => setNotifications(!notifications)}
            />
            <View style={{ width: 8 }} />
            <Button title="Enable" onPress={() => setNotifications(true)} />
            <View style={{ width: 8 }} />
            <Button title="Disable" onPress={() => setNotifications(false)} />
            <View style={{ width: 8 }} />
            <Button title="Clear" onPress={clearNotifications} />
          </View>
          <Text style={styles.caption}>
            Value:{' '}
            <Text style={styles.mono}>
              {notifications?.toString() ?? 'null'}
            </Text>{' '}
            | Exists:{' '}
            <Text style={styles.mono}>
              {hasNotifications ? 'true' : 'false'}
            </Text>
          </Text>
        </View>

        {/* Object Hook */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏗️ Object Hook</Text>
          <Text style={styles.code}>
            const [user, setUser, hasUser, clearUser] =
            usePreferenceObject&lt;User&gt;('user')
          </Text>
          <View style={styles.row}>
            <Button
              title="Set John"
              onPress={() =>
                setUser({ name: 'John', age: 25, email: 'john@example.com' })
              }
            />
            <View style={{ width: 8 }} />
            <Button
              title="Set Jane"
              onPress={() =>
                setUser({ name: 'Jane', age: 30, email: 'jane@example.com' })
              }
            />
            <View style={{ width: 8 }} />
            <Button title="Clear" onPress={clearUser} />
          </View>
          <View style={styles.objectDisplay}>
            <Text style={styles.caption}>
              Exists:{' '}
              <Text style={styles.mono}>{hasUser ? 'true' : 'false'}</Text>
            </Text>
            {user && (
              <View style={styles.objectContent}>
                <Text style={styles.objectField}>Name: {user.name}</Text>
                <Text style={styles.objectField}>Age: {user.age}</Text>
                <Text style={styles.objectField}>Email: {user.email}</Text>
              </View>
            )}
            {!user && <Text style={styles.objectField}>No user data</Text>}
          </View>
        </View>

        {/* Demo Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎮 Demo Actions</Text>
          <View style={styles.row}>
            <Button
              title="Fill All"
              onPress={() => {
                setUsername('Demo User');
                setCount(42);
                setNotifications(true);
                setUser({ name: 'Demo', age: 25, email: 'demo@example.com' });
              }}
            />
            <View style={{ width: 8 }} />
            <Button
              title="Clear All"
              onPress={() => {
                clearUsername();
                clearCount();
                clearNotifications();
                clearUser();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 16, paddingBottom: 8 },
  title: { color: 'white', fontWeight: '700', fontSize: 20 },
  subtitle: { color: '#cbd5e1', marginTop: 4 },
  ns: {
    color: '#93c5fd',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  sectionTitle: { color: 'white', fontWeight: '600', marginBottom: 8 },
  code: {
    color: '#a78bfa',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    marginBottom: 12,
    lineHeight: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  btn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: 'white', fontWeight: '600', textAlign: 'center' },
  caption: { color: '#9ca3af', marginTop: 4 },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    color: '#93c5fd',
  },
  objectDisplay: {
    marginTop: 8,
  },
  objectContent: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#0b1220',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  objectField: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 4,
  },
});
