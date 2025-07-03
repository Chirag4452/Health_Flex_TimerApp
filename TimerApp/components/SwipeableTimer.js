import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import Timer from './Timer';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3; // 30% of screen width

/**
 * SwipeableTimer component - Timer with swipe-to-delete functionality
 * Only allows deletion of custom timers (not default ones)
 * @param {Object} props - Component props
 * @param {Object} props.timer - Timer object with id, name, duration, category, is_default
 * @param {Function} props.onComplete - Callback when timer completes
 * @param {Function} props.onDelete - Callback when timer is deleted
 * @param {Function} props.onViewHistory - Callback when View History is pressed
 * @param {Object} ref - React ref for external control
 */
const SwipeableTimer = forwardRef(({ timer, onComplete, onDelete, onViewHistory }, ref) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  // Reference to the Timer component for forwarding methods
  const timer_component_ref = useRef(null);

  // Forward timer control methods to the Timer component
  useImperativeHandle(ref, () => ({
    start_timer: () => {
      console.log(`🔄 SwipeableTimer: start_timer called for ${timer.name}, inner ref exists: ${!!timer_component_ref.current}`);
      if (timer_component_ref.current) {
        timer_component_ref.current.start_timer();
      } else {
        console.warn(`❌ SwipeableTimer: No timer_component_ref for ${timer.name}`);
      }
    },
    pause_timer: () => {
      console.log(`🔄 SwipeableTimer: pause_timer called for ${timer.name}, inner ref exists: ${!!timer_component_ref.current}`);
      if (timer_component_ref.current) {
        timer_component_ref.current.pause_timer();
      } else {
        console.warn(`❌ SwipeableTimer: No timer_component_ref for ${timer.name}`);
      }
    },
    reset_timer: () => {
      console.log(`🔄 SwipeableTimer: reset_timer called for ${timer.name}, inner ref exists: ${!!timer_component_ref.current}`);
      if (timer_component_ref.current) {
        timer_component_ref.current.reset_timer();
      } else {
        console.warn(`❌ SwipeableTimer: No timer_component_ref for ${timer.name}`);
      }
    },
    get_timer_state: () => {
      if (timer_component_ref.current) {
        return timer_component_ref.current.get_timer_state();
      }
      return null;
    }
  }), [timer.name]);

  /**
   * Handles the delete action with confirmation
   */
  const handle_delete = () => {
    Alert.alert(
      'Delete Timer',
      `Are you sure you want to delete "${timer.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => reset_position(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(timer.id);
            }
          },
        },
      ]
    );
  };

  /**
   * Resets the timer position to original
   */
  const reset_position = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    lastOffset.current = 0;
  };

  /**
   * Animates to delete position
   */
  const animate_to_delete = () => {
    Animated.spring(translateX, {
      toValue: -120, // Show delete button
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    lastOffset.current = -120;
  };

  // PanResponder for handling swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes and only for custom timers
      return !timer.is_default && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },

    onPanResponderGrant: () => {
      // Set offset when gesture starts
      translateX.setOffset(lastOffset.current);
      translateX.setValue(0);
    },

    onPanResponderMove: (evt, gestureState) => {
      // Only allow left swipe (negative dx) for custom timers
      if (!timer.is_default && gestureState.dx < 0) {
        translateX.setValue(gestureState.dx);
      }
    },

    onPanResponderRelease: (evt, gestureState) => {
      // Flatten offset
      translateX.flattenOffset();
      
      if (!timer.is_default) {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe was far enough, show delete button
          animate_to_delete();
        } else {
          // Not far enough, reset position
          reset_position();
        }
      }
    },
  });

  // Don't show swipe functionality for default timers
  if (timer.is_default) {
    return (
      <Timer
        ref={timer_component_ref}
        name={timer.name}
        duration={timer.duration}
        category={timer.category}
        onComplete={() => onComplete(timer.name)}
        onViewHistory={onViewHistory}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Delete Button (Hidden behind the timer) */}
      <View style={styles.delete_container}>
        <TouchableOpacity style={styles.delete_button} onPress={handle_delete}>
          <Text style={styles.delete_text}>🗑️</Text>
          <Text style={styles.delete_label}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Timer Container */}
      <Animated.View
        style={[
          styles.timer_container,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Timer
          ref={timer_component_ref}
          name={timer.name}
          duration={timer.duration}
          category={timer.category}
          onComplete={() => onComplete(timer.name)}
          onViewHistory={onViewHistory}
        />
      </Animated.View>
    </View>
  );
});

export default SwipeableTimer;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 5,
  },
  timer_container: {
    backgroundColor: '#fff',
    zIndex: 1,
  },
  delete_container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    borderRadius: 12,
    marginHorizontal: 10,
    zIndex: 0,
  },
  delete_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  delete_text: {
    fontSize: 24,
    marginBottom: 4,
  },
  delete_label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 