import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';

/**
 * AddTimerScreen component - Form to create new timers
 * Allows users to input timer name and duration, with validation
 */
export default function AddTimerScreen({ navigation }) {
  // Form state management
  const [timer_name, set_timer_name] = useState('');
  const [duration_minutes, set_duration_minutes] = useState('');

  /**
   * Validates form inputs
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validate_form = () => {
    // Check if timer name is provided
    if (!timer_name.trim()) {
      Alert.alert('Validation Error', 'Please enter a timer name');
      return false;
    }

    // Check if duration is provided and is a valid number
    if (!duration_minutes.trim()) {
      Alert.alert('Validation Error', 'Please enter a duration');
      return false;
    }

    const duration_number = parseFloat(duration_minutes);
    if (isNaN(duration_number) || duration_number <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid duration (greater than 0)');
      return false;
    }

    // Check for reasonable duration limits (max 999 minutes)
    if (duration_number > 999) {
      Alert.alert('Validation Error', 'Duration cannot exceed 999 minutes');
      return false;
    }

    return true;
  };

  /**
   * Handles saving the timer and navigating back
   */
  const handle_save_timer = () => {
    if (!validate_form()) {
      return;
    }

    // Convert duration from minutes to seconds
    const duration_seconds = Math.floor(parseFloat(duration_minutes) * 60);

    // Create timer object
    const new_timer = {
      id: Date.now(), // Simple ID generation using timestamp
      name: timer_name.trim(),
      duration: duration_seconds,
    };

    // Navigate to Home tab with timer data
    navigation.navigate('Home', { new_timer });

    // Clear the form after successful save
    set_timer_name('');
    set_duration_minutes('');

    // Show success message
    Alert.alert(
      'Success!',
      `Timer "${new_timer.name}" has been created!`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Handles clearing the form
   */
  const handle_clear_form = () => {
    set_timer_name('');
    set_duration_minutes('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scroll_container} keyboardShouldPersistTaps="handled">
        <View style={styles.form_container}>
          {/* Header */}
          <Text style={styles.title}>Add New Timer</Text>
          <Text style={styles.subtitle}>Create a custom timer with your preferred duration</Text>

          {/* Timer Name Input */}
          <View style={styles.input_group}>
            <Text style={styles.label}>Timer Name</Text>
            <TextInput
              style={styles.text_input}
              placeholder="Enter timer name (e.g., Study Session)"
              value={timer_name}
              onChangeText={set_timer_name}
              maxLength={50}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Duration Input */}
          <View style={styles.input_group}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.text_input}
              placeholder="Enter duration in minutes"
              value={duration_minutes}
              onChangeText={set_duration_minutes}
              keyboardType="numeric"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handle_save_timer}
            />
            {duration_minutes && (
              <Text style={styles.helper_text}>
                ≈ {Math.floor(parseFloat(duration_minutes) || 0)} minutes
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.button_container}>
            <TouchableOpacity
              style={[styles.button, styles.clear_button]}
              onPress={handle_clear_form}
            >
              <Text style={styles.clear_button_text}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.save_button]}
              onPress={handle_save_timer}
            >
              <Text style={styles.save_button_text}>Save Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll_container: {
    flex: 1,
  },
  form_container: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input_group: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  text_input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  helper_text: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  button_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  save_button: {
    backgroundColor: '#007AFF',
  },
  clear_button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  save_button_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clear_button_text: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 