import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, StyleSheet } from 'react-native';

import StoresScreen from './screens/StoresScreen';
import TypedScreen from './screens/TypedScreen';
import HooksScreen from './screens/HooksScreen';
import BenchmarksScreen from './screens/BenchmarksScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ children, color }: { children: string; color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>{children}</Text>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#111827',
              borderTopColor: '#1f2937',
            },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#9ca3af',
            headerStyle: {
              backgroundColor: '#111827',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Stores"
            component={StoresScreen}
            options={{
              tabBarIcon: ({ color }) => <TabIcon color={color}>🗂</TabIcon>,
            }}
          />
          <Tab.Screen
            name="Typed"
            component={TypedScreen}
            options={{
              tabBarIcon: ({ color }) => <TabIcon color={color}>🔢</TabIcon>,
            }}
          />
          <Tab.Screen
            name="Hooks"
            component={HooksScreen}
            options={{
              tabBarIcon: ({ color }) => <TabIcon color={color}>🪝</TabIcon>,
            }}
          />
          <Tab.Screen
            name="Bench"
            component={BenchmarksScreen}
            options={{
              tabBarIcon: ({ color }) => <TabIcon color={color}>⚡️</TabIcon>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 18,
  },
});
