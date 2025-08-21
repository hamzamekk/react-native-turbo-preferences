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

export default function NormalScreen() {
  const [namespace, setNamespace] = useState<string>('');
  const [effectiveNamespace, setEffectiveNamespace] =
    useState<string>('(default)');
  const [keyName, setKeyName] = useState('username');
  const [keyValue, setKeyValue] = useState('Hamza');
  const [currentValue, setCurrentValue] = useState<string | null>(null);
  const [multipleKeys, setMultipleKeys] = useState('theme,lang,username');
  const [all, setAll] = useState<Record<string, string>>({});

  const refreshValue = useCallback(async () => {
    if (!keyName) return;
    try {
      const v = await Prefs.get(keyName);
      setCurrentValue(v);
    } catch (error) {
      console.warn('Error getting value:', error);
    }
  }, [keyName]);

  const refreshAll = useCallback(async () => {
    const obj = await Prefs.getAll();
    setAll(obj || {});
  }, []);

  const applyNamespace = useCallback(async () => {
    const trimmedNamespace = namespace.trim();
    await Prefs.setName(trimmedNamespace || null);
    setEffectiveNamespace(trimmedNamespace || '(default)');
    await Promise.all([refreshValue(), refreshAll()]);
    Alert.alert(
      'Namespace switched',
      `Now using: ${trimmedNamespace || '(default)'}`
    );
  }, [namespace, refreshValue, refreshAll]);

  const resetNamespace = useCallback(async () => {
    setNamespace('');
    await Prefs.setName(null);
    setEffectiveNamespace('(default)');
    await Promise.all([refreshValue(), refreshAll()]);
  }, [refreshValue, refreshAll]);

  const doSave = useCallback(async () => {
    if (!keyName) return Alert.alert('Key required');
    await Prefs.set(keyName, keyValue);
    await refreshValue();
    await refreshAll();
  }, [keyName, keyValue, refreshValue, refreshAll]);

  const doContains = useCallback(async () => {
    if (!keyName) return Alert.alert('Key required');
    const exists = await Prefs.contains(keyName);
    Alert.alert('Contains?', `${keyName} -> ${exists ? 'Yes' : 'No'}`);
  }, [keyName]);

  const doRemove = useCallback(async () => {
    if (!keyName) return Alert.alert('Key required');
    await Prefs.clear(keyName);
    await refreshValue();
    await refreshAll();
  }, [keyName, refreshValue, refreshAll]);

  const doBatchSet = useCallback(async () => {
    await Prefs.setMultiple([
      { key: 'theme', value: 'dark' },
      { key: 'lang', value: 'ar' },
      { key: 'pace', value: '90' },
    ]);
    await refreshAll();
  }, [refreshAll]);

  const doGetMultiple = useCallback(async () => {
    const keys = multipleKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);
    if (keys.length === 0) return Alert.alert('Keys required');

    try {
      const values = await Prefs.getMultiple(keys);
      Alert.alert('Get Multiple Result', JSON.stringify(values, null, 2));
    } catch (error) {
      Alert.alert('Error', `getMultiple error: ${error}`);
    }
  }, [multipleKeys]);

  const doRemoveMultiple = useCallback(async () => {
    const keys = multipleKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);
    if (keys.length === 0) return Alert.alert('Keys required');

    try {
      await Prefs.clearMultiple(keys);
      await refreshAll();
      Alert.alert('Success', `Removed keys: ${keys.join(', ')}`);
    } catch (error) {
      Alert.alert('Error', `clearMultiple error: ${error}`);
    }
  }, [multipleKeys, refreshAll]);

  const doClearAll = useCallback(async () => {
    await Prefs.clearAll();
    await Promise.all([refreshValue(), refreshAll()]);
  }, [refreshValue, refreshAll]);

  useEffect(() => {
    refreshValue();
    refreshAll();
  }, [refreshValue, refreshAll]);

  const allEntries = useMemo(() => Object.entries(all), [all]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Imperative API</Text>
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
            <Button title="Get" onPress={refreshValue} />
            <View style={{ width: 8 }} />
            <Button title="Set" onPress={doSave} />
            <View style={{ width: 8 }} />
            <Button title="Contains?" onPress={doContains} />
            <View style={{ width: 8 }} />
            <Button title="Remove" onPress={doRemove} />
          </View>
          <Text style={styles.caption}>
            Current value:{' '}
            <Text style={styles.mono}>{currentValue ?? 'null'}</Text>
          </Text>
        </View>

        {/* Batch ops */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Batch Operations</Text>
          <Field
            label="Keys (comma-separated)"
            value={multipleKeys}
            onChangeText={setMultipleKeys}
            placeholder="theme,lang,username"
          />
          <View style={styles.row}>
            <Button
              title="Set Multiple (theme/lang/pace)"
              onPress={doBatchSet}
            />
            <View style={{ width: 12 }} />
            <Button title="Get Multiple" onPress={doGetMultiple} />
          </View>
          <View style={styles.row}>
            <Button title="Remove Multiple" onPress={doRemoveMultiple} />
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
