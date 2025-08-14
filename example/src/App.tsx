import {
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { get, set, clear, clearAll } from 'react-native-turbo-preferences';
import { useState } from 'react';

export default function App() {
  const [value, setValue] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');

  const addValue = async () => {
    await set('names', newValue);
    setNewValue('');
  };

  const getValue = async () => {
    const value = await get('names');
    setValue(value || '');
  };

  const clearValue = async () => {
    await clear('names');
    setValue('');
  };

  const clearAllValue = async () => {
    await clearAll();
    setValue('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Enter you name"
        onChangeText={(text) => setNewValue(text)}
        value={newValue}
      />
      <Button title="Add" onPress={addValue} />
      <Button title="Get" onPress={getValue} />
      <Button title="Clear" onPress={clearValue} />
      <Button title="Clear All" onPress={clearAllValue} />
      <Text style={styles.text}>Value: {value}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  separator: {
    height: 10,
  },
  text: {
    color: 'black',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    color: 'black',
  },
});
