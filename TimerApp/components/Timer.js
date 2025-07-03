import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Timer component with countdown functionality
 * Props:
 * - name: string - Display name for the timer
 * - duration: number - Timer duration in seconds
 * - category: string - Timer category (optional)
 * - onComplete: function - Callback when timer reaches zero
 */
export default function Timer({ name, duration, category, onComplete }) {
  // State management for timer functionality
  const [remaining_time, set_remaining_time] = useState(duration);
  const [is_running, set_is_running] = useState(false);

  /**
   * Formats time from seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  const format_time = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining_seconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining_seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Starts or pauses the timer
   */
  const toggle_timer = () => {
    set_is_running(!is_running);
  };

  /**
   * Resets the timer to initial duration and stops it
   */
  const reset_timer = () => {
    set_is_running(false);
    set_remaining_time(duration);
  };

  // Effect hook for countdown logic and cleanup
  useEffect(() => {
    let interval_id;

    // Set up interval when timer is running
    if (is_running && remaining_time > 0) {
      interval_id = setInterval(() => {
        set_remaining_time((prev_time) => {
          const new_time = prev_time - 1;
          
          // Call onComplete callback when timer reaches zero
          if (new_time <= 0) {
            set_is_running(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          
          return new_time;
        });
      }, 1000);
    }

    // Cleanup function to clear interval
    return () => {
      if (interval_id) {
        clearInterval(interval_id);
      }
    };
  }, [is_running, remaining_time, onComplete]);

  // Effect to stop timer when remaining_time reaches 0
  useEffect(() => {
    if (remaining_time === 0 && is_running) {
      set_is_running(false);
    }
  }, [remaining_time, is_running]);

  return (
    <View style={styles.container}>
      {/* Timer name and category display */}
      <View style={styles.header_container}>
        <Text style={styles.timer_name}>{name}</Text>
        {category && (
          <View style={styles.category_badge}>
            <Text style={styles.category_text}>{category}</Text>
          </View>
        )}
      </View>
      
      {/* Remaining time display in MM:SS format */}
      <Text style={styles.time_display}>
        {format_time(remaining_time)}
      </Text>
      
      {/* Control buttons */}
      <View style={styles.button_container}>
        {/* Start/Pause button */}
        <TouchableOpacity
          style={[
            styles.button,
            is_running ? styles.pause_button : styles.start_button
          ]}
          onPress={toggle_timer}
          disabled={remaining_time === 0}
        >
          <Text style={styles.button_text}>
            {is_running ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
        
        {/* Reset button */}
        <TouchableOpacity
          style={[styles.button, styles.reset_button]}
          onPress={reset_timer}
        >
          <Text style={styles.button_text}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    margin: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header_container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timer_name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  category_badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category_text: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  time_display: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  button_container: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  start_button: {
    backgroundColor: '#28a745',
  },
  pause_button: {
    backgroundColor: '#ffc107',
  },
  reset_button: {
    backgroundColor: '#dc3545',
  },
  button_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 