import { Text, View, StyleSheet, Button } from 'react-native';
import { multiply, get, set, setName } from 'react-native-turbo-preferences';
import { useState } from 'react';

const result = multiply(3, 7);

export default function App() {
  const [value, setValue] = useState('');
  const [value_default, setValue_default] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Result: {result}</Text>
      <Text style={styles.text}>Value: {value}</Text>
      <Text style={styles.text}>Value default: {value_default}</Text>

      <Button title="set name default" onPress={() => setName('default')} />

      <Button title="Set Value" onPress={() => set('username', 'John')} />
      <Button
        title="Get Value"
        onPress={() => get('username').then((value) => setValue(value || ''))}
      />

      <View style={styles.separator} />
      <Button
        title="Set Name new default"
        onPress={() => setName('new_default')}
      />
      <Button title="Set Name default" onPress={() => setName('default')} />
      <Button
        title="Get Value default"
        onPress={() =>
          get('username').then((value) => setValue_default(value || ''))
        }
      />
      <Button
        title="Set Value default"
        onPress={() => set('username', 'John_default')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  separator: {
    height: 10,
  },
  text: {
    color: 'black',
  },
});
