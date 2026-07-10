import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  createStore,
  usePreferenceString,
  usePreferenceBoolean,
  usePreferenceObject,
} from 'react-native-turbo-preferences';

const settingsStore = createStore('settings');

interface Profile {
  name: string;
  level: number;
}

/**
 * Two totally independent components using the same key — they stay in
 * sync because hooks subscribe to store change events.
 */
function UsernameEditor({ label }: { label: string }) {
  const [username, setUsername, hasUsername, clearUsername] =
    usePreferenceString('hooks_username');
  const [draft, setDraft] = useState('');

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardSubtitle}>
        usePreferenceString('hooks_username')
      </Text>
      <Text style={styles.value}>
        value = {username ?? 'null'} · contains = {String(hasUsername)}
      </Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="new username"
          placeholderTextColor="#6b7280"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => draft && setUsername(draft)}
        >
          <Text style={styles.buttonText}>Set</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={clearUsername}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HooksScreen() {
  // Hook scoped to a named store via the second argument
  const [notifications, setNotifications] = usePreferenceBoolean(
    'hooks_notifications',
    settingsStore
  );
  const [profile, setProfile, , clearProfile] =
    usePreferenceObject<Profile>('hooks_profile');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>
        The two panels below are separate components sharing one key. Change it
        in either — both update. Writes from the Stores tab (or native code)
        update them too.
      </Text>

      <UsernameEditor label="Component A" />
      <UsernameEditor label="Component B" />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Store-scoped hook</Text>
        <Text style={styles.cardSubtitle}>
          usePreferenceBoolean('hooks_notifications', settingsStore)
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.value}>
            notifications ={' '}
            {notifications === null ? 'null' : String(notifications)}
          </Text>
          <Switch
            value={notifications ?? false}
            onValueChange={setNotifications}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Object hook (JSON built in)</Text>
        <Text style={styles.cardSubtitle}>
          {"usePreferenceObject<Profile>('hooks_profile')"}
        </Text>
        <Text style={styles.value}>
          {profile ? JSON.stringify(profile) : 'null'}
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              setProfile({
                name: 'Hamza',
                level: (profile?.level ?? 0) + 1,
              })
            }
          >
            <Text style={styles.buttonText}>Level up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={clearProfile}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
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
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 8,
    color: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#4b5563' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  value: {
    color: '#d1d5db',
    fontFamily: 'Menlo',
    fontSize: 13,
    marginBottom: 4,
  },
});
