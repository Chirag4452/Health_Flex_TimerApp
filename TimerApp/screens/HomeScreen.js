import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Timer from '../components/Timer';

/**
 * HomeScreen component - displays the main home screen of the Timer App
 * Shows sample timers to demonstrate Timer component functionality
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
        <Text style={styles.screen_title}>Home Screen</Text>
        <Text style={styles.subtitle}>Timer App Demo</Text>
      </View>

      {/* Sample timers to demonstrate functionality */}
      <Timer
        name="Pomodoro Timer"
        duration={25 * 60} // 25 minutes
        onComplete={() => handle_timer_complete('Pomodoro Timer')}
      />

      <Timer
        name="Short Break"
        duration={5 * 60} // 5 minutes
        onComplete={() => handle_timer_complete('Short Break')}
      />

      <Timer
        name="Long Break"
        duration={15 * 60} // 15 minutes
        onComplete={() => handle_timer_complete('Long Break')}
      />

      <Timer
        name="Quick Test"
        duration={10} // 10 seconds for testing
        onComplete={() => handle_timer_complete('Quick Test')}
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
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  screen_title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
}); 