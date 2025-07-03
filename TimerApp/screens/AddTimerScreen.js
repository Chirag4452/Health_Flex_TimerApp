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
import { use_theme } from '../contexts/ThemeContext';

// Predefined category options
const PREDEFINED_CATEGORIES = [
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'exercise', label: 'Exercise', icon: '💪' },
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'break', label: 'Break', icon: '☕' },
  { id: 'other', label: 'Other', icon: '📝' },
];

/**
 * AddTimerScreen component - Form to create new timers
 * Allows users to input timer name, duration, and category with validation
 */
export default function AddTimerScreen({ navigation }) {
  // Get theme context
  const { theme } = use_theme();
  
  // Form state management
  const [timer_name, set_timer_name] = useState('');
  const [duration_minutes, set_duration_minutes] = useState('');
  const [selected_category, set_selected_category] = useState('');
  const [custom_category, set_custom_category] = useState('');
  const [is_custom_category, set_is_custom_category] = useState(false);

  /**
   * Handles category selection
   * @param {string} category_id - ID of the selected category
   */
  const handle_category_select = (category_id) => {
    if (category_id === 'other') {
      set_is_custom_category(true);
      set_selected_category('');
    } else {
      set_is_custom_category(false);
      set_selected_category(category_id);
      set_custom_category('');
    }
  };

  /**
   * Gets the final category value for saving
   * @returns {string} - The category to save
   */
  const get_final_category = () => {
    if (is_custom_category) {
      return custom_category.trim();
    }
    const selected = PREDEFINED_CATEGORIES.find(cat => cat.id === selected_category);
    return selected ? selected.label : '';
  };

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

    // Check if category is selected or custom category is provided
    const final_category = get_final_category();
    if (!final_category) {
      Alert.alert('Validation Error', 'Please select a category or enter a custom category');
      return false;
    }

    // Validate custom category length
    if (is_custom_category && final_category.length > 20) {
      Alert.alert('Validation Error', 'Custom category cannot exceed 20 characters');
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
    const final_category = get_final_category();

    // Create timer object with category
    const new_timer = {
      id: Date.now(), // Simple ID generation using timestamp
      name: timer_name.trim(),
      duration: duration_seconds,
      category: final_category,
      created_at: new Date().toISOString(),
    };

    // Navigate to Home tab with timer data
    navigation.navigate('Home', { new_timer });

    // Clear the form after successful save
    set_timer_name('');
    set_duration_minutes('');
    set_selected_category('');
    set_custom_category('');
    set_is_custom_category(false);

    // Show success message
    Alert.alert(
      'Success!',
      `Timer "${new_timer.name}" has been created in "${final_category}" category!`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Handles clearing the form
   */
  const handle_clear_form = () => {
    set_timer_name('');
    set_duration_minutes('');
    set_selected_category('');
    set_custom_category('');
    set_is_custom_category(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background_primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scroll_container} keyboardShouldPersistTaps="handled">
        <View style={styles.form_container}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text_primary }]}>Add New Timer</Text>
          <Text style={[styles.subtitle, { color: theme.text_secondary }]}>Create a custom timer with your preferred duration and category</Text>

          {/* Timer Name Input */}
          <View style={styles.input_group}>
            <Text style={[styles.label, { color: theme.text_primary }]}>Timer Name</Text>
            <TextInput
              style={[styles.text_input, { 
                backgroundColor: theme.card_background,
                borderColor: theme.border_primary,
                color: theme.text_primary 
              }]}
              placeholder="Enter timer name (e.g., Study Session)"
              placeholderTextColor={theme.text_tertiary}
              value={timer_name}
              onChangeText={set_timer_name}
              maxLength={50}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Duration Input */}
          <View style={styles.input_group}>
            <Text style={[styles.label, { color: theme.text_primary }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.text_input, { 
                backgroundColor: theme.card_background,
                borderColor: theme.border_primary,
                color: theme.text_primary 
              }]}
              placeholder="Enter duration in minutes"
              placeholderTextColor={theme.text_tertiary}
              value={duration_minutes}
              onChangeText={set_duration_minutes}
              keyboardType="numeric"
              maxLength={6}
              returnKeyType="done"
            />
            {duration_minutes && (
              <Text style={[styles.helper_text, { color: theme.text_secondary }]}>
                ≈ {Math.floor(parseFloat(duration_minutes) || 0)} minutes
              </Text>
            )}
          </View>

          {/* Category Selection */}
          <View style={styles.input_group}>
            <Text style={[styles.label, { color: theme.text_primary }]}>Category</Text>
            <View style={styles.category_container}>
              {PREDEFINED_CATEGORIES.map((category) => {
                const is_selected = (selected_category === category.id || (category.id === 'other' && is_custom_category));
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.category_button,
                      { 
                        backgroundColor: is_selected ? theme.button_primary : theme.card_background,
                        borderColor: is_selected ? theme.button_primary : theme.border_primary 
                      }
                    ]}
                    onPress={() => handle_category_select(category.id)}
                  >
                    <Text style={styles.category_icon}>{category.icon}</Text>
                    <Text style={[
                      styles.category_text,
                      { color: is_selected ? theme.text_inverse : theme.text_primary }
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Category Input */}
            {is_custom_category && (
              <View style={styles.custom_category_container}>
                <TextInput
                  style={[styles.text_input, { 
                    backgroundColor: theme.card_background,
                    borderColor: theme.border_primary,
                    color: theme.text_primary 
                  }]}
                  placeholder="Enter custom category"
                  placeholderTextColor={theme.text_tertiary}
                  value={custom_category}
                  onChangeText={set_custom_category}
                  maxLength={20}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
                <Text style={[styles.helper_text, { color: theme.text_secondary }]}>
                  Custom category ({custom_category.length}/20 characters)
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.button_container}>
            <TouchableOpacity
              style={[styles.button, { 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: theme.border_primary 
              }]}
              onPress={handle_clear_form}
            >
              <Text style={[styles.clear_button_text, { color: theme.text_primary }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button_primary }]}
              onPress={handle_save_timer}
            >
              <Text style={[styles.save_button_text, { color: theme.text_inverse }]}>Save Timer</Text>
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  input_group: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  text_input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  helper_text: {
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  category_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  category_button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 90,
  },
  category_icon: {
    fontSize: 16,
    marginRight: 6,
  },
  category_text: {
    fontSize: 14,
    fontWeight: '500',
  },
  custom_category_container: {
    marginTop: 10,
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
  save_button_text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clear_button_text: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 