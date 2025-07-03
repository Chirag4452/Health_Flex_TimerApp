import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Theme definitions for light and dark modes
 * Contains all color values used throughout the app
 */
const theme_definitions = {
  light: {
    // Background colors
    background_primary: '#ffffff',
    background_secondary: '#f8f9fa',
    background_tertiary: '#e9ecef',
    
    // Text colors
    text_primary: '#333333',
    text_secondary: '#666666',
    text_tertiary: '#999999',
    text_inverse: '#ffffff',
    
    // Card and surface colors
    card_background: '#ffffff',
    section_header_background: '#f8f9fa',
    
    // Border colors
    border_primary: '#e9ecef',
    border_secondary: '#dee2e6',
    
    // Button colors
    button_primary: '#007AFF',
    button_success: '#4CAF50',
    button_warning: '#FF9500',
    button_danger: '#dc3545',
    button_secondary: '#6c757d',
    
    // Special colors
    shadow_color: '#000000',
    overlay_background: 'rgba(0, 0, 0, 0.5)',
    
    // Timer specific colors
    timer_running: '#4CAF50',
    timer_paused: '#FF9500',
    timer_completed: '#6c757d',
    
    // Statistics colors
    stats_background: '#e8f5e8',
    stats_border: '#4CAF50',
    stats_text: '#2E7D32',
  },
  dark: {
    // Background colors
    background_primary: '#121212',
    background_secondary: '#1e1e1e',
    background_tertiary: '#2d2d2d',
    
    // Text colors
    text_primary: '#ffffff',
    text_secondary: '#b3b3b3',
    text_tertiary: '#808080',
    text_inverse: '#000000',
    
    // Card and surface colors
    card_background: '#1e1e1e',
    section_header_background: '#2d2d2d',
    
    // Border colors
    border_primary: '#404040',
    border_secondary: '#333333',
    
    // Button colors
    button_primary: '#0A84FF',
    button_success: '#30D158',
    button_warning: '#FF9F0A',
    button_danger: '#FF453A',
    button_secondary: '#8E8E93',
    
    // Special colors
    shadow_color: '#000000',
    overlay_background: 'rgba(0, 0, 0, 0.7)',
    
    // Timer specific colors
    timer_running: '#30D158',
    timer_paused: '#FF9F0A',
    timer_completed: '#8E8E93',
    
    // Statistics colors
    stats_background: '#1a2e1a',
    stats_border: '#30D158',
    stats_text: '#4CAF50',
  },
};

/**
 * Theme context for managing app-wide theme state
 */
const ThemeContext = createContext({
  theme: theme_definitions.light,
  is_dark_mode: false,
  toggle_theme: () => {},
});

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context values
 */
export const use_theme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('use_theme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme provider component to wrap the app
 * Manages theme state and persistence
 */
export const ThemeProvider = ({ children }) => {
  const [is_dark_mode, set_is_dark_mode] = useState(false);
  const [is_loading, set_is_loading] = useState(true);

  /**
   * Loads theme preference from storage
   */
  const load_theme_preference = async () => {
    try {
      const stored_theme = await AsyncStorage.getItem('theme_preference');
      if (stored_theme !== null) {
        const is_dark = stored_theme === 'dark';
        set_is_dark_mode(is_dark);
        console.log(`🎨 Theme: Loaded preference - ${stored_theme}`);
      } else {
        console.log(`🎨 Theme: No preference found, using light mode`);
      }
    } catch (error) {
      console.error('🎨 Theme: Error loading theme preference:', error);
    } finally {
      set_is_loading(false);
    }
  };

  /**
   * Saves theme preference to storage
   * @param {boolean} is_dark - Whether dark mode is enabled
   */
  const save_theme_preference = async (is_dark) => {
    try {
      const theme_value = is_dark ? 'dark' : 'light';
      await AsyncStorage.setItem('theme_preference', theme_value);
      console.log(`🎨 Theme: Saved preference - ${theme_value}`);
    } catch (error) {
      console.error('🎨 Theme: Error saving theme preference:', error);
    }
  };

  /**
   * Toggles between light and dark theme
   */
  const toggle_theme = () => {
    const new_dark_mode = !is_dark_mode;
    set_is_dark_mode(new_dark_mode);
    save_theme_preference(new_dark_mode);
    console.log(`🎨 Theme: Switched to ${new_dark_mode ? 'dark' : 'light'} mode`);
  };

  // Load theme preference on mount
  useEffect(() => {
    load_theme_preference();
  }, []);

  // Don't render children until theme is loaded
  if (is_loading) {
    return null; // Or a loading spinner if needed
  }

  // Get current theme based on mode
  const current_theme = is_dark_mode ? theme_definitions.dark : theme_definitions.light;

  const context_value = {
    theme: current_theme,
    is_dark_mode,
    toggle_theme,
  };

  return (
    <ThemeContext.Provider value={context_value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 