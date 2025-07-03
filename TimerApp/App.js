import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import AddTimerScreen from './screens/AddTimerScreen';

// Import theme context
import { ThemeProvider, use_theme } from './contexts/ThemeContext';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

/**
 * App content component that uses theme context
 * Contains navigation and header with theme support
 */
function AppContent() {
  const { theme, is_dark_mode, toggle_theme } = use_theme();

  return (
    <NavigationContainer>
      <View style={[styles.header, { backgroundColor: theme.background_secondary, borderBottomColor: theme.border_primary }]}>
        {/* Left spacer for balanced layout */}
        <View style={styles.header_left} />
        
        {/* Centered title */}
        <View style={styles.header_center}>
          <Text style={[styles.app_title, { color: theme.text_primary }]}>Health Flex</Text>
        </View>
        
        {/* Right section with theme toggle */}
        <View style={styles.header_right}>
          <TouchableOpacity
            style={[styles.theme_toggle, { backgroundColor: theme.button_secondary }]}
            onPress={toggle_theme}
            activeOpacity={0.7}
          >
            <Text style={[styles.theme_toggle_text, { color: theme.text_inverse }]}>
              {is_dark_mode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.button_primary,
          tabBarInactiveTintColor: theme.text_secondary,
          tabBarStyle: [styles.tab_bar, { 
            backgroundColor: theme.card_background, 
            borderTopColor: theme.border_primary 
          }],
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
      <StatusBar style={is_dark_mode ? "light" : "dark"} />
    </NavigationContainer>
  );
}

/**
 * Main App component with theme provider
 * Wraps the entire app with theme context
 */
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  header_left: {
    flex: 2,
    // Left spacer for balanced layout
  },
  header_center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header_right: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  app_title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  theme_toggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    background_color:'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'transparent',
    elevation: 0,
  },
  theme_toggle_text: {
    fontSize: 18,
  },
  tab_bar: {
    borderTopWidth: 1,
  },
});
