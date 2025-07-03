import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { use_theme } from '../contexts/ThemeContext';

/**
 * ProgressBar component - Visual progress indicator
 * Props:
 * - progress: number (0-1) - Progress percentage as decimal
 * - color: string - Color of the progress bar (optional, defaults to theme primary)
 * - height: number - Height of the progress bar (optional, default 8)
 * - backgroundColor: string - Background color (optional, defaults to theme secondary background)
 */
export default function ProgressBar({ 
  progress, 
  color, 
  height = 8, 
  background_color 
}) {
  const { theme } = use_theme();
  
  // Use theme colors as defaults if not provided
  const progress_color = color || theme.button_primary;
  const bg_color = background_color || theme.background_secondary;
  
  // Animated value for smooth progress transitions
  const animated_progress = useRef(new Animated.Value(0)).current;

  /**
   * Animates progress bar to new value
   */
  useEffect(() => {
    // Ensure progress is between 0 and 1
    const clamped_progress = Math.max(0, Math.min(1, progress));
    
    Animated.timing(animated_progress, {
      toValue: clamped_progress,
      duration: 300, // Smooth 300ms transition
      useNativeDriver: false, // Width changes require layout animations
    }).start();
  }, [progress, animated_progress]);

  // Convert animated value to width percentage
  const animated_width = animated_progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { height, backgroundColor: bg_color }]}>
      <Animated.View
        style={[
          styles.progress_fill,
          {
            width: animated_width,
            backgroundColor: progress_color,
            height: height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progress_fill: {
    borderRadius: 4,
    minWidth: 2, // Minimum width for visibility
  },
}); 