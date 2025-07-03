import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';
import CompletionModal from './CompletionModal';
import { add_timer_to_history } from '../utils/history';

/**
 * Timer component - displays a countdown timer with start/pause/reset functionality
 * Shows a celebratory completion modal when timer finishes
 * @param {Object} props - Component props
 * @param {string} props.name - Name/title of the timer
 * @param {number} props.duration - Duration in seconds
 * @param {string} props.category - Category of the timer (optional)
 * @param {Function} props.onComplete - Callback when timer reaches zero (optional)
 * @param {Function} props.onViewHistory - Callback when View History is pressed from modal (optional)
 * @param {Object} ref - React ref for external control
 */
const Timer = forwardRef(({ name, duration, category, onComplete, onViewHistory }, ref) => {
  // State management for timer functionality
  const [remaining_time, set_remaining_time] = useState(duration);
  const [is_running, set_is_running] = useState(false);
  
  // State for completion modal
  const [show_completion_modal, set_show_completion_modal] = useState(false);

  // Ref to store the interval ID for cleanup
  const interval_ref = useRef(null);

  /**
   * Formats time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time string
   */
  const format_time = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining_seconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining_seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Calculates the progress of the timer (0 to 1)
   * @returns {number} - Progress value between 0 and 1
   */
  const calculate_progress = () => {
    if (duration === 0) return 0;
    return Math.max(0, Math.min(1, (duration - remaining_time) / duration));
  };

  /**
   * Gets the current timer state color based on status
   * @returns {string} - Color code for the current state
   */
  const get_state_color = () => {
    if (remaining_time === 0) return '#6c757d'; // Gray for completed
    if (is_running) return '#28a745'; // Green for running
    return '#ffc107'; // Yellow for paused
  };

  /**
   * Gets the current timer state text
   * @returns {string} - State description text
   */
  const get_state_text = () => {
    if (remaining_time === 0) return 'Completed';
    if (is_running) return 'Running';
    return 'Paused';
  };

  /**
   * Starts the timer
   */
  const start_timer = () => {
    if (remaining_time > 0) {
      set_is_running(true);
    }
  };

  /**
   * Pauses the timer
   */
  const pause_timer = () => {
    set_is_running(false);
  };

  /**
   * Resets the timer to initial duration
   */
  const reset_timer = () => {
    set_is_running(false);
    set_remaining_time(duration);
    set_show_completion_modal(false);
  };

  /**
   * Handles timer completion
   */
  const handle_timer_complete = async () => {
    console.log(`🎉 Timer "${name}" completed! Adding to history...`);
    
    set_is_running(false);
    set_show_completion_modal(true);
    
    // Add completed timer to history with comprehensive data
    try {
      console.log(`📊 Calling add_timer_to_history with:`, { name, duration, category });
      const success = await add_timer_to_history(name, duration, category);
      if (success) {
        console.log(`✅ Successfully added "${name}" to history`);
      } else {
        console.warn(`❌ Failed to save "${name}" to history - storage issue`);
        // Note: We don't show user error here to avoid disrupting celebration
        // History will be available on next app launch via storage recovery
      }
    } catch (error) {
      console.error('💥 Error adding timer to history:', error);
      // Silent fail - don't interrupt user celebration with technical errors
      // History system is supplementary, not critical to timer functionality
    }
    
    // Call the original onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  /**
   * Handles closing the completion modal
   */
  const handle_modal_close = () => {
    set_show_completion_modal(false);
  };

  /**
   * Handles restarting timer from completion modal
   */
  const handle_modal_restart = () => {
    set_show_completion_modal(false);
    reset_timer();
    // Small delay to ensure modal closes before restarting
    setTimeout(() => {
      start_timer();
    }, 100);
  };

  /**
   * Handles view history action from completion modal
   */
  const handle_modal_view_history = () => {
    set_show_completion_modal(false);
    if (onViewHistory) {
      onViewHistory();
    }
  };

  // Effect to handle countdown logic
  useEffect(() => {
    if (is_running && remaining_time > 0) {
      interval_ref.current = setInterval(() => {
        set_remaining_time(prev_time => {
          if (prev_time <= 1) {
            // Timer completed - stop running and trigger completion
            set_is_running(false);
            // Call completion handler directly to avoid race conditions
            setTimeout(() => {
              handle_timer_complete();
            }, 50);
            return 0;
          }
          return prev_time - 1;
        });
      }, 1000);
    } else {
      // Clear interval when paused or completed
      if (interval_ref.current) {
        clearInterval(interval_ref.current);
        interval_ref.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (interval_ref.current) {
        clearInterval(interval_ref.current);
      }
    };
  }, [is_running, remaining_time]);

  // Expose methods for external control (bulk actions)
  useImperativeHandle(ref, () => ({
    start_timer: () => {
      console.log(`⏰ Timer ${name}: start_timer called, remaining_time: ${remaining_time}, is_running: ${is_running}`);
      if (remaining_time > 0 && !is_running) {
        console.log(`▶️ Timer ${name}: Starting timer`);
        set_is_running(true);
      } else {
        console.log(`⚠️ Timer ${name}: Cannot start - remaining_time: ${remaining_time}, is_running: ${is_running}`);
      }
    },
    pause_timer: () => {
      console.log(`⏰ Timer ${name}: pause_timer called, is_running: ${is_running}`);
      if (is_running) {
        console.log(`⏸️ Timer ${name}: Pausing timer`);
        set_is_running(false);
      } else {
        console.log(`⚠️ Timer ${name}: Cannot pause - not running`);
      }
    },
    reset_timer: () => {
      console.log(`⏰ Timer ${name}: reset_timer called`);
      console.log(`🔄 Timer ${name}: Resetting timer`);
      set_is_running(false);
      set_remaining_time(duration);
      set_show_completion_modal(false);
    },
    get_timer_state: () => ({
      is_running,
      remaining_time,
      progress: calculate_progress()
    })
  }), [is_running, remaining_time, duration, name]);

  // Prepare timer data for the completion modal
  const timer_data = {
    name,
    duration,
    category
  };

  return (
    <View style={styles.container}>
      {/* Timer Header */}
      <View style={styles.header}>
        <Text style={styles.timer_name}>{name}</Text>
        {category && (
          <View style={styles.category_badge}>
            <Text style={styles.category_text}>{category}</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progress_container}>
        <ProgressBar 
          progress={calculate_progress()} 
          color={get_state_color()}
          height={8}
          background_color="#e9ecef"
        />
        <View style={styles.progress_info}>
          <Text style={[styles.progress_percentage, { color: get_state_color() }]}>
            {Math.round(calculate_progress() * 100)}%
          </Text>
          <View style={styles.state_indicator}>
            <View style={[styles.state_dot, { backgroundColor: get_state_color() }]} />
            <Text style={[styles.state_text, { color: get_state_color() }]}>
              {get_state_text()}
            </Text>
          </View>
        </View>
      </View>

      {/* Timer Display */}
      <View style={styles.time_display}>
        <Text style={styles.time_text}>{format_time(remaining_time)}</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!is_running ? (
          <TouchableOpacity 
            style={[styles.button, styles.start_button]} 
            onPress={start_timer}
            disabled={remaining_time === 0}
          >
            <Text style={styles.button_text}>
              {remaining_time === 0 ? 'Completed' : 'Start'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.pause_button]} 
            onPress={pause_timer}
          >
            <Text style={styles.button_text}>Pause</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.reset_button]} 
          onPress={reset_timer}
        >
          <Text style={styles.button_text}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Completion Modal */}
      <CompletionModal
        visible={show_completion_modal}
        timer_data={timer_data}
        onClose={handle_modal_close}
        onRestart={handle_modal_restart}
        onViewHistory={handle_modal_view_history}
      />
    </View>
  );
});

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
  header: {
    alignItems: 'center',
    marginBottom: 15,
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
  progress_container: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  progress_info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress_percentage: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  state_indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  state_dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  state_text: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  time_display: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  time_text: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  controls: {
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

export default Timer; 