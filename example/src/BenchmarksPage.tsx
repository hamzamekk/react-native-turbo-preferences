import { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Prefs from 'react-native-turbo-preferences';

interface BenchmarkResult {
  operation: string;
  duration: number;
  count: number;
  throughput: number;
}

interface Props {
  onBack: () => void;
}

export default function BenchmarksPage({ onBack }: Props) {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);

  const runBenchmark = async (
    operation: string,
    testFn: () => Promise<void>,
    count: number
  ) => {
    const start = performance.now();
    await testFn();
    const duration = performance.now() - start;
    const throughput = count / (duration / 1000); // operations per second

    // Handle sub-millisecond operations properly
    const roundedDuration =
      duration < 1 ? Math.round(duration * 1000) / 1000 : Math.round(duration);

    return {
      operation,
      duration: roundedDuration,
      count,
      throughput: Math.round(throughput),
    };
  };

  const testSingleSet = async () => {
    const count = 100;
    for (let i = 0; i < count; i++) {
      await Prefs.set(`single_key_${i}`, `value_${i}`);
    }
  };

  const testSingleGet = async () => {
    const count = 100;
    for (let i = 0; i < count; i++) {
      await Prefs.get(`single_key_${i}`);
    }
  };

  const testBatchSet = async () => {
    const count = 100;
    const batchData = Array.from({ length: count }, (_, i) => ({
      key: `batch_key_${i}`,
      value: `batch_value_${i}`,
    }));
    await Prefs.setMultiple(batchData);
  };

  const testBatchGet = async () => {
    const count = 100;
    const keys = Array.from({ length: count }, (_, i) => `batch_key_${i}`);
    await Prefs.getMultiple(keys);
  };

  const testNamespaceSwitch = async () => {
    const count = 50;
    for (let i = 0; i < count; i++) {
      await Prefs.setName(`namespace_${i}`);
      await Prefs.set('test', 'value');
    }
    await Prefs.setName(''); // Reset to default
  };

  const runAllBenchmarks = async () => {
    setRunning(true);
    setResults([]);

    try {
      const newResults: BenchmarkResult[] = [];

      // Test single operations
      newResults.push(
        await runBenchmark('Single Set (100)', testSingleSet, 100)
      );
      newResults.push(
        await runBenchmark('Single Get (100)', testSingleGet, 100)
      );

      // Test batch operations
      newResults.push(await runBenchmark('Batch Set (100)', testBatchSet, 100));
      newResults.push(await runBenchmark('Batch Get (100)', testBatchGet, 100));

      // Test namespace switching
      newResults.push(
        await runBenchmark('Namespace Switch (50)', testNamespaceSwitch, 50)
      );

      setResults(newResults);

      // Show summary
      const totalTime = newResults.reduce((sum, r) => sum + r.duration, 0);
      Alert.alert(
        'Benchmark Complete!',
        `Total time: ${totalTime}ms\nOperations: ${newResults.reduce((sum, r) => sum + r.count, 0)}`
      );
    } catch (error) {
      Alert.alert('Benchmark Error', `Error: ${error}`);
    } finally {
      setRunning(false);
    }
  };

  const clearAllData = async () => {
    try {
      await Prefs.clearAll();
      Alert.alert('Success', 'All data cleared!');
    } catch (error) {
      Alert.alert('Error', `Failed to clear: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>🚀 Performance Benchmarks</Text>
          <Text style={styles.subtitle}>
            Real performance testing on your device
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, running && styles.buttonDisabled]}
            onPress={runAllBenchmarks}
            disabled={running}
          >
            <Text style={styles.buttonText}>
              {running ? 'Running...' : '🏃‍♂️ Run All Benchmarks'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.clearButton]}
            onPress={clearAllData}
            disabled={running}
          >
            <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
          </Pressable>
        </View>

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>📊 Your Benchmark Results</Text>

            {results.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultOperation}>{result.operation}</Text>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetail}>
                    ⏱️{' '}
                    {result.duration < 1
                      ? `${(result.duration * 1000).toFixed(1)}μs`
                      : `${result.duration}ms`}
                  </Text>
                  <Text style={styles.resultDetail}>
                    📈 {result.throughput} ops/sec
                  </Text>
                  <Text style={styles.resultDetail}>
                    🔢 {result.count} operations
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.benchmarkContainer}>
          <Text style={styles.benchmarkTitle}>📊 Official Benchmarks</Text>

          <View style={styles.platformSection}>
            <Text style={styles.platformTitle}>🤖 Android (Real Device)</Text>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Single Set (100)</Text>
              <Text style={styles.benchmarkValue}>232ms • 431 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Single Get (100)</Text>
              <Text style={styles.benchmarkValue}>100ms • 995 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Batch Set (100)</Text>
              <Text style={styles.benchmarkValue}>9ms • 11,700 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Batch Get (100)</Text>
              <Text style={styles.benchmarkValue}>6ms • 18,000 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>
                Namespace Switch (50)
              </Text>
              <Text style={styles.benchmarkValue}>77ms • 646 ops/sec</Text>
            </View>
          </View>

          <View style={styles.platformSection}>
            <Text style={styles.platformTitle}>🍎 iOS (iPhone SE, iOS 18)</Text>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Single Set (100)</Text>
              <Text style={styles.benchmarkValue}>32ms • 3,117 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Single Get (100)</Text>
              <Text style={styles.benchmarkValue}>78ms • 1,277 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Batch Set (100)</Text>
              <Text style={styles.benchmarkValue}>
                ~0.1ms • 331,950 ops/sec
              </Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>Batch Get (100)</Text>
              <Text style={styles.benchmarkValue}>85ms • 1,172 ops/sec</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkOperation}>
                Namespace Switch (50)
              </Text>
              <Text style={styles.benchmarkValue}>2ms • 33,123 ops/sec</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ What We're Testing:</Text>
          <Text style={styles.infoText}>
            • Single get/set operations (100x)
          </Text>
          <Text style={styles.infoText}>• Batch get/set operations (100x)</Text>
          <Text style={styles.infoText}>• Namespace switching (50x)</Text>
          <Text style={styles.infoText}>• Real device performance metrics</Text>
          <Text style={styles.infoText}>
            • Compare with official benchmarks
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  resultOperation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 8,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  resultDetail: {
    fontSize: 14,
    color: '#cbd5e1',
    marginRight: 8,
  },
  benchmarkContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  benchmarkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  platformSection: {
    marginBottom: 20,
  },
  platformTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 12,
  },
  benchmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  benchmarkOperation: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
  },
  benchmarkValue: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  comingSoon: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  infoContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
  },
});
