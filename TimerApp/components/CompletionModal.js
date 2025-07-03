import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { use_theme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

/**
 * CompletionModal component - Shows a celebratory modal when a timer completes
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Object} props.timer_data - Timer data object with name, duration, category
 * @param {Function} props.onClose - Callback when Close button is pressed
 * @param {Function} props.onRestart - Callback when Restart Timer button is pressed
 * @param {Function} props.onViewHistory - Callback when View History button is pressed
 */
export default function CompletionModal({ 
  visible, 
  timer_data, 
  onClose, 
  onRestart, 
  onViewHistory 
}) {
  const { theme } = use_theme();

  /**
   * Formats duration in seconds to MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} - Formatted time string
   */
  const format_time = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining_seconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining_seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modal_overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modal_container, { 
          backgroundColor: theme.background_primary,
          shadowColor: theme.shadow 
        }]}>
          {/* Celebration Header */}
          <View style={styles.celebration_header}>
            <Text style={styles.celebration_emoji}>🎉</Text>
            <Text style={[styles.celebration_title, { color: theme.button_success }]}>Timer Complete!</Text>
            <Text style={styles.celebration_emoji}>🎉</Text>
          </View>

          {/* Timer Details */}
          <View style={[styles.timer_details, { 
            backgroundColor: theme.background_secondary,
            borderColor: theme.border 
          }]}>
            <Text style={[styles.timer_name, { color: theme.text_primary }]}>{timer_data?.name || 'Timer'}</Text>
            {timer_data?.duration && (
              <Text style={[styles.timer_duration, { color: theme.text_secondary }]}>
                Duration: {format_time(timer_data.duration)}
              </Text>
            )}
            {timer_data?.category && (
              <View style={styles.category_container}>
                <Text style={[styles.category_label, { color: theme.text_secondary }]}>Category:</Text>
                <View style={[styles.category_badge, { backgroundColor: theme.button_primary }]}>
                  <Text style={[styles.category_text, { color: theme.text_inverse }]}>{timer_data.category}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Congratulatory Message */}
          <View style={[styles.message_container, { 
            backgroundColor: theme.stats_background,
            borderLeftColor: theme.button_success 
          }]}>
            <Text style={[styles.congrats_message, { color: theme.text_primary }]}>
              Congratulations! You've successfully completed your timer. 
              Great job staying focused! 💪
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttons_container}>
            {/* Restart Timer Button */}
            <TouchableOpacity
              style={[styles.action_button, { backgroundColor: theme.button_success }]}
              onPress={onRestart}
              activeOpacity={0.8}
            >
              <Text style={[styles.button_text, { color: theme.text_inverse }]}>🔄 Restart Timer</Text>
            </TouchableOpacity>

            {/* View History Button */}
            <TouchableOpacity
              style={[styles.action_button, { backgroundColor: theme.button_primary }]}
              onPress={onViewHistory}
              activeOpacity={0.8}
            >
              <Text style={[styles.button_text, { color: theme.text_inverse }]}>📊 View History</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.action_button, { 
                backgroundColor: theme.background_secondary,
                borderWidth: 1,
                borderColor: theme.border
              }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.button_text, { color: theme.text_primary }]}>✨ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorative_elements}>
            <Text style={styles.decoration_emoji}>⭐</Text>
            <Text style={styles.decoration_emoji}>🌟</Text>
            <Text style={styles.decoration_emoji}>✨</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal_overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal_container: {
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    maxWidth: 400,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  celebration_header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  celebration_emoji: {
    fontSize: 32,
    marginHorizontal: 10,
  },
  celebration_title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timer_details: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  timer_name: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  timer_duration: {
    fontSize: 16,
    marginBottom: 8,
  },
  category_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category_label: {
    fontSize: 14,
  },
  category_badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category_text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  message_container: {
    marginBottom: 25,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  congrats_message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  buttons_container: {
    gap: 12,
  },
  action_button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
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
  button_text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  decorative_elements: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    gap: 5,
  },
  decoration_emoji: {
    fontSize: 20,
    opacity: 0.7,
  },
}); 