import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * HistoryScreen component - displays the history screen of the Timer App
 * Shows a centered title indicating this is the History screen
 */
export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.screen_title}>History Screen</Text>
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