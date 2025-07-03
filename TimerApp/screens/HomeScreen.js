import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Timer from '../components/Timer';

/**
 * HomeScreen component - displays the main home screen of the Timer App
 * Shows test timers with different durations to demonstrate Timer component functionality
 */
export default function HomeScreen() {
  /**
   * Callback function when a timer completes
   * @param {string} timer_name - Name of the completed timer
   */
  const handle_timer_complete = (timer_name) => {
    Alert.alert(
      'Timer Complete!',
      `${timer_name} has finished!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screen_title}>My Timers</Text>
      </View>

      {/* Test timers with different durations */}
      <Timer
        name="1 Minute Timer"
        duration={60} // 60 seconds
        onComplete={() => handle_timer_complete('1 Minute Timer')}
      />

      <Timer
        name="2 Minute Timer"
        duration={120} // 120 seconds
        onComplete={() => handle_timer_complete('2 Minute Timer')}
      />

      <Timer
        name="5 Minute Timer"
        duration={300} // 300 seconds
        onComplete={() => handle_timer_complete('5 Minute Timer')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  screen_title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
}); 