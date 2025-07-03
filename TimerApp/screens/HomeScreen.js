import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * HomeScreen component - displays the main home screen of the Timer App
 * Shows a centered title indicating this is the Home screen
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.screen_title}>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen_title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
}); 