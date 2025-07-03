import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Timer from '../components/Timer';
import SwipeableTimer from '../components/SwipeableTimer';
import { save_timers, load_timers } from '../utils/storage';

/**
 * HomeScreen component - displays the main home screen of the Timer App
 * Shows test timers with different durations and custom user-created timers
 * Persists timers data using AsyncStorage
 */
export default function HomeScreen({ navigation, route }) {
  // State for storing all timers (both default and custom)
  const [timers_list, set_timers_list] = useState([]);
  
  // Loading state for initial data load
  const [is_loading, set_is_loading] = useState(true);
  
  // State to track if we're currently saving (optional, for debugging)
  const [is_saving, set_is_saving] = useState(false);

  /**
   * Gets default timers with categories
   * @returns {Array} - Default timers array with categories
   */
  const get_default_timers_with_categories = () => {
    return [
      {
        id: 'default-1',
        name: '1 Minute Timer',
        duration: 60,
        category: 'Break',
        is_default: true,
      },
      {
        id: 'default-2', 
        name: '2 Minute Timer',
        duration: 120,
        category: 'Break',
        is_default: true,
      },
      {
        id: 'default-3',
        name: '5 Minute Timer', 
        duration: 300,
        category: 'Study',
        is_default: true,
      },
    ];
  };

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

  /**
   * Handles navigation to Add Timer screen
   */
  const handle_add_timer = () => {
    navigation.navigate('AddTimer');
  };

  /**
   * Handles deleting a custom timer
   * @param {string} timer_id - ID of the timer to delete
   */
  const handle_delete_timer = (timer_id) => {
    // Remove timer from state
    set_timers_list(prev_timers => {
      const updated_timers = prev_timers.filter(timer => timer.id !== timer_id);
      return updated_timers;
    });
    
    // Show confirmation message
    Alert.alert(
      'Timer Deleted',
      'Timer has been successfully deleted.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Loads timers from storage on component mount
   */
  const load_timers_from_storage = async () => {
    try {
      set_is_loading(true);
      const loaded_timers = await load_timers();
      
      // If loaded timers don't have categories, merge with defaults that have categories
      const updated_timers = loaded_timers.map(timer => {
        if (timer.is_default && !timer.category) {
          const default_timer = get_default_timers_with_categories().find(def => def.id === timer.id);
          return default_timer || timer;
        }
        return timer;
      });
      
      set_timers_list(updated_timers);
    } catch (error) {
      console.error('Failed to load timers:', error);
      Alert.alert(
        'Loading Error',
        'Failed to load saved timers. Using default timers.',
        [{ text: 'OK' }]
      );
      // Fallback to default timers with categories
      set_timers_list(get_default_timers_with_categories());
    } finally {
      set_is_loading(false);
    }
  };

  /**
   * Saves current timers list to storage
   * @param {Array} timers - Timers array to save
   */
  const save_timers_to_storage = async (timers) => {
    try {
      set_is_saving(true);
      const success = await save_timers(timers);
      if (!success) {
        console.warn('Failed to save timers to storage');
      }
    } catch (error) {
      console.error('Error saving timers:', error);
    } finally {
      set_is_saving(false);
    }
  };

  // Load timers from storage on component mount
  useEffect(() => {
    load_timers_from_storage();
  }, []);

  // Save timers to storage whenever timers list changes
  useEffect(() => {
    // Don't save during initial loading or if timers list is empty
    if (!is_loading && timers_list.length > 0) {
      save_timers_to_storage(timers_list);
    }
  }, [timers_list, is_loading]);

  // Handle new timer data from AddTimerScreen
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.new_timer) {
        const { new_timer } = route.params;
        
        // Add the new timer to timers list
        set_timers_list(prev_timers => {
          // Check if timer with same ID already exists (prevent duplicates)
          const timer_exists = prev_timers.some(timer => timer.id === new_timer.id);
          if (!timer_exists) {
            return [...prev_timers, { ...new_timer, is_default: false }];
          }
          return prev_timers;
        });

        // Clear the navigation params to prevent re-adding on subsequent visits
        navigation.setParams({ new_timer: undefined });
      }
    }, [route.params?.new_timer, navigation])
  );

  // Separate timers into custom and default
  const custom_timers = timers_list.filter(timer => !timer.is_default);
  const default_timers = timers_list.filter(timer => timer.is_default);

  // Group custom timers by category
  const grouped_custom_timers = custom_timers.reduce((groups, timer) => {
    const category = timer.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(timer);
    return groups;
  }, {});

  // Show loading indicator while loading timers
  if (is_loading) {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loading_text}>Loading your timers...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screen_title}>My Timers</Text>
        
        {/* Add Timer Button */}
        <TouchableOpacity
          style={styles.add_button}
          onPress={handle_add_timer}
        >
          <Text style={styles.add_button_text}>+ Add Timer</Text>
        </TouchableOpacity>

        {/* Optional: Show saving indicator */}
        {is_saving && (
          <View style={styles.saving_indicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.saving_text}>Saving...</Text>
          </View>
        )}
      </View>

      {/* Custom Timers by Category */}
      {Object.keys(grouped_custom_timers).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.section_title}>Custom Timers</Text>
          <Text style={styles.swipe_hint}>💡 Swipe left on custom timers to delete</Text>
          {Object.entries(grouped_custom_timers).map(([category, timers]) => (
            <View key={category} style={styles.category_group}>
              <Text style={styles.category_title}>{category}</Text>
              {timers.map((timer) => (
                <SwipeableTimer
                  key={timer.id}
                  timer={timer}
                  onComplete={handle_timer_complete}
                  onDelete={handle_delete_timer}
                />
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Default Test Timers Section */}
      <View style={styles.section}>
        <Text style={styles.section_title}>Default Timers</Text>
        {default_timers.map((timer) => (
          <Timer
            key={timer.id}
            name={timer.name}
            duration={timer.duration}
            category={timer.category}
            onComplete={() => handle_timer_complete(timer.name)}
          />
        ))}
      </View>

      {/* Instructions if no custom timers */}
      {custom_timers.length === 0 && (
        <View style={styles.instructions_container}>
          <Text style={styles.instructions_text}>
            Tap "Add Timer" to create your custom timers with categories
          </Text>
          <Text style={styles.swipe_instructions}>
            Once you have custom timers, you can swipe left to delete them
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loading_text: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  screen_title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  add_button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  add_button_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saving_indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  saving_text: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  section_title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  swipe_hint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 20,
    marginBottom: 10,
  },
  category_group: {
    marginBottom: 20,
  },
  category_title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  instructions_container: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  instructions_text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  swipe_instructions: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 