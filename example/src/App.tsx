// App.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';

import Prefs from 'react-native-turbo-preferences';

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

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

// --- Hook: simple getter/setter for a specific key (string values) ---
function usePreference(key: string) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    try {
      const v = await Prefs.get(key);
      setValue(v);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const save = useCallback(
    async (newVal: string) => {
      if (!key) return;
      setLoading(true);
      try {
        await Prefs.set(key, newVal);
        setValue(newVal);
      } finally {
        setLoading(false);
      }
    },
    [key]
  );

  const remove = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    try {
      await Prefs.clear(key);
      setValue(null);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { value, loading, refresh, save, remove };
}

// --- Main app ---
export default function App() {
  const [namespace, setNamespace] = useState<string>(''); // empty = standard/default
  const [effectiveNamespace, setEffectiveNamespace] =
    useState<string>('(default)');
  const [keyName, setKeyName] = useState('username');
  const [keyValue, setKeyValue] = useState('Hamza');

  const [all, setAll] = useState<Record<string, string>>({});
  const kv = usePreference(keyName);

  const refreshAll = useCallback(async () => {
    const obj = await Prefs.getAll();
    setAll(obj || {});
  }, []);
  const applyNamespace = useCallback(async () => {
    const trimmedNamespace = namespace.trim();
    Prefs.setName(trimmedNamespace ? trimmedNamespace : '');
    setEffectiveNamespace(trimmedNamespace ? trimmedNamespace : '(default)');
    // refresh views after switching
    await Promise.all([kv.refresh(), refreshAll()]);
    Alert.alert(
      'Namespace switched',
      `Now using: ${namespace.trim() || '(default)'}`
    );
  }, [namespace, kv, refreshAll]);

  const resetNamespace = useCallback(async () => {
    setNamespace('');
    await Prefs.setName('(default)');
    setEffectiveNamespace('(default)');
    await Promise.all([kv.refresh(), refreshAll()]);
  }, [kv, refreshAll]);

  const doSave = useCallback(async () => {
    if (!keyName) return Alert.alert('Key required');
    await Prefs.set(keyName, keyValue);
    await kv.refresh();
    await refreshAll();
  }, [keyName, keyValue, kv, refreshAll]);

  const doContains = useCallback(async () => {
    if (!keyName) return Alert.alert('Key required');
    const exists = await Prefs.contains(keyName);
    Alert.alert('Contains?', `${keyName} -> ${exists ? 'Yes' : 'No'}`);
  }, [keyName]);

  const doRemove = useCallback(async () => {
    if (!keyName) return Alert.alert('Key required');
    await Prefs.clear(keyName);
    await kv.refresh();
    await refreshAll();
  }, [keyName, kv, refreshAll]);

  const doBatchSet = useCallback(async () => {
    await Prefs.setMultiple([
      { key: 'theme', value: 'dark' },
      { key: 'lang', value: 'ar' },
      { key: 'pace', value: '90' },
    ]);
    await refreshAll();
  }, [refreshAll]);

  // const doRemoveMultiple = useCallback(async () => {
  //   await Prefs.removeMultiple(['theme', 'lang', 'pace']);
  //   await refreshAll();
  // }, [refreshAll]);

  const doClearAll = useCallback(async () => {
    await Prefs.clearAll();
    await Promise.all([kv.refresh(), refreshAll()]);
  }, [kv, refreshAll]);

  const allEntries = useMemo(() => Object.entries(all), [all]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>TurboPreferences Playground</Text>
          <Text style={styles.subtitle}>
            Platform: {Platform.OS} • Namespace:{' '}
            <Text style={styles.ns}>{effectiveNamespace}</Text>
          </Text>
        </View>

        {/* Namespace / suite switcher */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Namespace (suite / file)</Text>
          <Field
            label={
              Platform.OS === 'ios'
                ? 'Suite name (e.g. group.com.your.app)'
                : 'File name (e.g. MyPrefs)'
            }
            value={namespace}
            onChangeText={setNamespace}
            placeholder={
              Platform.OS === 'ios' ? 'group.com.your.app' : 'MyPrefs'
            }
          />
          <View style={styles.row}>
            <Button title="Apply" onPress={applyNamespace} />
            <View style={{ width: 12 }} />
            <Button title="Reset to Default" onPress={resetNamespace} />
          </View>
        </View>

        {/* Single key operations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Single Key</Text>
          <Field
            label="Key"
            value={keyName}
            onChangeText={setKeyName}
            placeholder="username"
          />
          <Field
            label="Value (string)"
            value={keyValue}
            onChangeText={setKeyValue}
            placeholder="Hamza"
          />
          <View style={styles.row}>
            <Button title="Get" onPress={kv.refresh} />
            <View style={{ width: 8 }} />
            <Button title="Set" onPress={doSave} />
            <View style={{ width: 8 }} />
            <Button title="Contains?" onPress={doContains} />
            <View style={{ width: 8 }} />
            <Button title="Remove" onPress={doRemove} />
          </View>
          <Text style={styles.caption}>
            Current value: <Text style={styles.mono}>{kv.value ?? 'null'}</Text>
          </Text>
        </View>

        {/* Batch ops */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Batch</Text>
          <View style={styles.row}>
            <Button
              title="Set Multiple (theme/lang/pace)"
              onPress={doBatchSet}
            />
            {/* <View style={{ width: 12 }} />
          <Button title="Remove Multiple" onPress={doRemoveMultiple} /> */}
          </View>
        </View>

        {/* All values */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>All Keys in Store</Text>
            <View style={{ flex: 1 }} />
            <Button title="Refresh" onPress={refreshAll} />
            <View style={{ width: 8 }} />
            <Button title="Clear All" onPress={doClearAll} />
          </View>

          {allEntries.map(([k, v]) => (
            <View key={k} style={styles.item}>
              <Text style={styles.itemKey}>{k}</Text>
              <Text style={styles.itemVal}>{v}</Text>
            </View>
          ))}
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
  sectionTitle: { color: 'white', fontWeight: '600', marginBottom: 10 },
  label: { color: '#e5e7eb', marginBottom: 6 },
  input: {
    backgroundColor: '#0b1220',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: 'white', fontWeight: '600' },
  caption: { color: '#9ca3af', marginTop: 8 },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    color: '#93c5fd',
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1f2937',
  },
  itemKey: { color: 'white', fontWeight: '600' },
  itemVal: { color: '#9ca3af', marginTop: 2 },
});
