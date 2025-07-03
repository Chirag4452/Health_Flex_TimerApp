import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

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
      <View style={styles.modal_overlay}>
        <View style={styles.modal_container}>
          {/* Celebration Header */}
          <View style={styles.celebration_header}>
            <Text style={styles.celebration_emoji}>🎉</Text>
            <Text style={styles.celebration_title}>Timer Complete!</Text>
            <Text style={styles.celebration_emoji}>🎉</Text>
          </View>

          {/* Timer Details */}
          <View style={styles.timer_details}>
            <Text style={styles.timer_name}>{timer_data?.name || 'Timer'}</Text>
            {timer_data?.duration && (
              <Text style={styles.timer_duration}>
                Duration: {format_time(timer_data.duration)}
              </Text>
            )}
            {timer_data?.category && (
              <View style={styles.category_container}>
                <Text style={styles.category_label}>Category:</Text>
                <View style={styles.category_badge}>
                  <Text style={styles.category_text}>{timer_data.category}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Congratulatory Message */}
          <View style={styles.message_container}>
            <Text style={styles.congrats_message}>
              Congratulations! You've successfully completed your timer. 
              Great job staying focused! 💪
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttons_container}>
            {/* Restart Timer Button */}
            <TouchableOpacity
              style={[styles.action_button, styles.restart_button]}
              onPress={onRestart}
              activeOpacity={0.8}
            >
              <Text style={styles.restart_button_text}>🔄 Restart Timer</Text>
            </TouchableOpacity>

            {/* View History Button */}
            <TouchableOpacity
              style={[styles.action_button, styles.history_button]}
              onPress={onViewHistory}
              activeOpacity={0.8}
            >
              <Text style={styles.history_button_text}>📊 View History</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.action_button, styles.close_button]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.close_button_text}>✨ Close</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal_container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
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
    color: '#2E7D32',
    textAlign: 'center',
  },
  timer_details: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timer_name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  timer_duration: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  category_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category_label: {
    fontSize: 14,
    color: '#666',
  },
  category_badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category_text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  message_container: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  congrats_message: {
    fontSize: 16,
    color: '#2E7D32',
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
  restart_button: {
    backgroundColor: '#4CAF50',
  },
  restart_button_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  history_button: {
    backgroundColor: '#2196F3',
  },
  history_button_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  close_button: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  close_button_text: {
    color: '#495057',
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