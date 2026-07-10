import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  createStore,
  addPreferenceChangeListener,
} from 'react-native-turbo-preferences';
import type {
  PreferenceStore,
  PreferenceChangeEvent,
} from 'react-native-turbo-preferences';

const defaultStore = createStore();
const settingsStore = createStore('settings');

function StorePanel({
  store,
  title,
}: {
  store: PreferenceStore;
  title: string;
}) {
  const [key, setKey] = useState('theme');
  const [value, setValue] = useState('dark');
  const [contents, setContents] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setContents(await store.getAll());
  }, [store]);

  useEffect(() => {
    refresh();
    const subscription = store.addListener(() => refresh());
    return () => subscription.remove();
  }, [store, refresh]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>
        createStore({store.name ? `'${store.name}'` : ''})
      </Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={setKey}
          placeholder="key"
          placeholderTextColor="#6b7280"
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="value"
          placeholderTextColor="#6b7280"
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => key && store.set(key, value)}
        >
          <Text style={styles.buttonText}>Set</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => key && store.clear(key)}
        >
          <Text style={styles.buttonText}>Clear key</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={() => store.clearAll()}
        >
          <Text style={styles.buttonText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contents}>
        {Object.keys(contents).length === 0 ? (
          <Text style={styles.emptyText}>(empty)</Text>
        ) : (
          Object.entries(contents).map(([k, v]) => (
            <Text key={k} style={styles.contentRow}>
              <Text style={styles.contentKey}>{k}</Text> = {v}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

export default function StoresScreen() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const subscription = addPreferenceChangeListener(
      (event: PreferenceChangeEvent) => {
        const line = `"${event.key ?? '*'}" changed in ${
          event.store ?? 'default'
        }`;
        setEvents((prev) => [line, ...prev].slice(0, 8));
      }
    );
    return () => subscription.remove();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>
        Two independent stores, no global switching. Each panel refreshes itself
        through its own change listener.
      </Text>

      <StorePanel store={defaultStore} title="Default store" />
      <StorePanel store={settingsStore} title="'settings' store" />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change events</Text>
        <Text style={styles.cardSubtitle}>addPreferenceChangeListener()</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>Write something above…</Text>
        ) : (
          events.map((line, index) => (
            <Text key={index} style={styles.eventRow}>
              {line}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { padding: 16, paddingBottom: 40 },
  heading: { color: '#9ca3af', fontSize: 14, marginBottom: 16, lineHeight: 20 },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { color: '#f9fafb', fontSize: 16, fontWeight: '600' },
  cardSubtitle: {
    color: '#3b82f6',
    fontSize: 12,
    fontFamily: 'Menlo',
    marginTop: 2,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    color: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#4b5563' },
  buttonDanger: { backgroundColor: '#b91c1c' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  contents: { marginTop: 8 },
  contentRow: {
    color: '#d1d5db',
    fontFamily: 'Menlo',
    fontSize: 12,
    marginBottom: 2,
  },
  contentKey: { color: '#34d399' },
  emptyText: { color: '#6b7280', fontStyle: 'italic', fontSize: 13 },
  eventRow: {
    color: '#d1d5db',
    fontFamily: 'Menlo',
    fontSize: 12,
    marginBottom: 4,
  },
});
