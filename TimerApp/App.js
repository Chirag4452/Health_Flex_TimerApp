import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import AddTimerScreen from './screens/AddTimerScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

/**
 * Main App component with React Navigation bottom tabs
 * Features Home, Add Timer, and History screens with a Timer App title
 */
export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.header}>
        <Text style={styles.app_title}>Timer App</Text>
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: styles.tab_bar,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="AddTimer"
          component={AddTimerScreen}
          options={{
            tabBarLabel: 'Add Timer',
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: 'History',
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  app_title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tab_bar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
});
