import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  setBoolean,
  getBoolean,
  setInt,
  getInt,
  setDouble,
  getDouble,
  addPreferenceChangeListener,
} from 'react-native-turbo-preferences';

export default function TypedScreen() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [intError, setIntError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [b, i, d] = await Promise.all([
      getBoolean('demo_darkMode'),
      getInt('demo_streak'),
      getDouble('demo_progress'),
    ]);
    setDarkMode(b);
    setStreak(i);
    setProgress(d);
  }, []);

  useEffect(() => {
    refresh();
    const subscription = addPreferenceChangeListener(() => refresh());
    return () => subscription.remove();
  }, [refresh]);

  const tryBadInt = async () => {
    try {
      await setInt('demo_streak', 3.5);
      setIntError(null);
    } catch (error) {
      setIntError(String(error));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>
        Values below are stored as real native types — a Swift widget reads them
        with integer(forKey:), bool(forKey:); Kotlin uses getInt, getBoolean. No
        string parsing.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Boolean</Text>
        <Text style={styles.cardSubtitle}>
          setBoolean() → NSUserDefaults setBool / putBoolean
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.value}>
            demo_darkMode = {darkMode === null ? 'null' : String(darkMode)}
          </Text>
          <Switch
            value={darkMode ?? false}
            onValueChange={(v) => setBoolean('demo_darkMode', v)}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Integer (32-bit)</Text>
        <Text style={styles.cardSubtitle}>setInt() → setInteger / putInt</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.value}>demo_streak = {streak ?? 'null'}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => setInt('demo_streak', (streak ?? 0) - 1)}
            >
              <Text style={styles.buttonText}>−1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => setInt('demo_streak', (streak ?? 0) + 1)}
            >
              <Text style={styles.buttonText}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.linkButton} onPress={tryBadInt}>
          <Text style={styles.linkText}>Try setInt('demo_streak', 3.5)</Text>
        </TouchableOpacity>
        {intError && <Text style={styles.errorText}>{intError}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Double</Text>
        <Text style={styles.cardSubtitle}>
          setDouble() → setDouble / putFloat (Android has no putDouble)
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.value}>
            demo_progress = {progress === null ? 'null' : progress.toFixed(3)}
          </Text>
          <View style={styles.row}>
            {[0.25, 0.5, 0.75].map((v) => (
              <TouchableOpacity
                key={v}
                style={styles.stepButton}
                onPress={() => setDouble('demo_progress', v)}
              >
                <Text style={styles.buttonText}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  row: { flexDirection: 'row', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: { color: '#d1d5db', fontFamily: 'Menlo', fontSize: 13 },
  stepButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  linkButton: { marginTop: 12 },
  linkText: { color: '#60a5fa', fontSize: 13 },
  errorText: { color: '#f87171', fontSize: 12, marginTop: 6 },
});
