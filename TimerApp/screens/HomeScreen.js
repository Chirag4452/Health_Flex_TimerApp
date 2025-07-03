import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  // State to track which sections are expanded (by section id)
  const [expanded_sections, set_expanded_sections] = useState({
    'default_timers': true, // Default timers section always starts expanded
  });

  // Refs to access timer components for bulk actions
  const timer_refs = useRef({});
  
  // Function to create or get a ref for a timer
  const get_timer_ref = (timer_id) => {
    if (!timer_refs.current[timer_id]) {
      timer_refs.current[timer_id] = React.createRef();
      console.log(`🔄 Created new ref for timer: ${timer_id}`);
    }
    return timer_refs.current[timer_id];
  };

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
   * Toggles the expanded state of a section
   * @param {string} section_id - ID of the section to toggle
   */
  const toggle_section = (section_id) => {
    set_expanded_sections(prev => ({
      ...prev,
      [section_id]: !prev[section_id]
    }));
  };

  /**
   * Performs bulk action on all timers in a section
   * @param {string} action - Action to perform: 'start', 'pause', 'reset'
   * @param {Array} timers - Array of timers in the section
   * @param {string} section_title - Title of the section for confirmation messages
   */
  const handle_bulk_action = (action, timers, section_title) => {
    if (timers.length === 0) {
      Alert.alert('No Timers', `There are no timers in the ${section_title} category.`);
      return;
    }

    // Handle reset with confirmation
    if (action === 'reset') {
      Alert.alert(
        'Reset All Timers',
        `Are you sure you want to reset all timers in "${section_title}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset All',
            style: 'destructive',
            onPress: () => execute_bulk_action('reset', timers),
          },
        ]
      );
      return;
    }

    execute_bulk_action(action, timers);
  };

  /**
   * Executes the bulk action on timers
   * @param {string} action - Action to perform
   * @param {Array} timers - Array of timers to act on
   */
  const execute_bulk_action = (action, timers) => {
    console.log(`🚀 Starting bulk action: ${action} on ${timers.length} timers`);
    console.log(`📋 Timer IDs: ${timers.map(t => t.id).join(', ')}`);
    console.log(`🔗 Available refs: ${Object.keys(timer_refs.current).join(', ')}`);
    
    let action_count = 0;
    
    timers.forEach(timer => {
      console.log(`⏰ Processing timer: ${timer.id} (${timer.name})`);
      
      const timer_ref = timer_refs.current[timer.id];
      console.log(`🔍 Timer ref exists: ${!!timer_ref}, ref.current exists: ${!!(timer_ref && timer_ref.current)}`);
      
      if (timer_ref && timer_ref.current) {
        console.log(`📋 Available methods on ref:`, Object.keys(timer_ref.current));
        
        try {
          switch (action) {
            case 'start':
              if (timer_ref.current.start_timer) {
                console.log(`▶️ Calling start_timer on ${timer.id}`);
                timer_ref.current.start_timer();
                action_count++;
              } else {
                console.warn(`❌ start_timer method not found on ${timer.id}`);
              }
              break;
            case 'pause':
              if (timer_ref.current.pause_timer) {
                console.log(`⏸️ Calling pause_timer on ${timer.id}`);
                timer_ref.current.pause_timer();
                action_count++;
              } else {
                console.warn(`❌ pause_timer method not found on ${timer.id}`);
              }
              break;
            case 'reset':
              if (timer_ref.current.reset_timer) {
                console.log(`🔄 Calling reset_timer on ${timer.id}`);
                timer_ref.current.reset_timer();
                action_count++;
              } else {
                console.warn(`❌ reset_timer method not found on ${timer.id}`);
              }
              break;
          }
        } catch (error) {
          console.error(`💥 Failed to ${action} timer ${timer.id}:`, error);
        }
      } else {
        console.warn(`❌ No ref or ref.current found for timer ${timer.id}${timer_ref ? ', ref exists but no .current' : ', no ref at all'}`);
      }
    });

    console.log(`✅ Bulk action complete: ${action_count} out of ${timers.length} timers affected`);

    // Show feedback message
    if (action_count > 0) {
      const action_past_tense = action === 'start' ? 'started' : action === 'pause' ? 'paused' : 'reset';
      Alert.alert(
        'Bulk Action Complete',
        `${action_count} timer${action_count !== 1 ? 's' : ''} ${action_past_tense}.`,
        [{ text: 'OK' }]
      );
    } else {
      console.warn(`⚠️ No timers were affected by bulk ${action} action`);
      Alert.alert(
        'Bulk Action Failed',
        `No timers could be ${action}ed. Please check that timers are loaded properly.`,
        [{ text: 'OK' }]
      );
    }
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
   * Handles navigation to History screen
   */
  const handle_view_history = () => {
    navigation.navigate('History');
  };

  /**
   * Handles deleting a custom timer
   * @param {string} timer_id - ID of the timer to delete
   */
  const handle_delete_timer = (timer_id) => {
    // Clean up ref
    cleanup_timer_ref(timer_id);

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
   * Cleanup timer ref when component unmounts
   * @param {string} timer_id - ID of the timer
   */
  const cleanup_timer_ref = (timer_id) => {
    if (timer_refs.current[timer_id]) {
      console.log(`🗑️ Cleaning up ref for ${timer_id}`);
      delete timer_refs.current[timer_id];
    }
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

        // Automatically expand the new timer's category section
        if (new_timer.category) {
          const section_id = `custom_${new_timer.category.toLowerCase().replace(/\s+/g, '_')}`;
          set_expanded_sections(prev => ({
            ...prev,
            [section_id]: true
          }));
        }

        // Clear the navigation params to prevent re-adding on subsequent visits
        navigation.setParams({ new_timer: undefined });
      }
    }, [route.params?.new_timer, navigation])
  );

  // Prepare data for SectionList
  const prepare_section_data = () => {
    const custom_timers = timers_list.filter(timer => !timer.is_default);
    const default_timers = timers_list.filter(timer => timer.is_default);
    
    const sections = [];

    // Add custom timer sections grouped by category
    if (custom_timers.length > 0) {
      const grouped_custom = custom_timers.reduce((groups, timer) => {
        const category = timer.category || 'Uncategorized';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(timer);
        return groups;
      }, {});

      Object.entries(grouped_custom).forEach(([category, timers]) => {
        const section_id = `custom_${category.toLowerCase().replace(/\s+/g, '_')}`;
        sections.push({
          id: section_id,
          title: category,
          is_custom: true,
          data: expanded_sections[section_id] ? timers : [],
          all_data: timers, // Keep reference to all data for counting
        });
      });
    }

    // Add default timers section
    if (default_timers.length > 0) {
      sections.push({
        id: 'default_timers',
        title: 'Default Timers',
        is_custom: false,
        data: expanded_sections['default_timers'] ? default_timers : [],
        all_data: default_timers,
      });
    }

    return sections;
  };

  /**
   * Renders the bulk action buttons for a section
   */
  const render_bulk_actions = (section) => {
    return (
      <View style={styles.bulk_actions_container}>
        <TouchableOpacity
          style={[styles.bulk_action_button, styles.start_all_button]}
          onPress={() => handle_bulk_action('start', section.all_data, section.title)}
        >
          <Text style={styles.bulk_action_text}>Start All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bulk_action_button, styles.pause_all_button]}
          onPress={() => handle_bulk_action('pause', section.all_data, section.title)}
        >
          <Text style={styles.bulk_action_text}>Pause All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bulk_action_button, styles.reset_all_button]}
          onPress={() => handle_bulk_action('reset', section.all_data, section.title)}
        >
          <Text style={styles.bulk_action_text}>Reset All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders the section header with expand/collapse functionality and bulk actions
   */
  const render_section_header = ({ section }) => {
    const is_expanded = expanded_sections[section.id];
    const timer_count = section.all_data.length;
    
    return (
      <View style={styles.section_header}>
        <TouchableOpacity
          style={styles.section_header_main}
          onPress={() => toggle_section(section.id)}
          activeOpacity={0.7}
        >
          <View style={styles.section_header_content}>
            <View style={styles.section_title_container}>
              <Text style={styles.section_title}>{section.title}</Text>
              <Text style={styles.timer_count}>({timer_count})</Text>
            </View>
            <View style={styles.expand_indicator}>
              <Text style={styles.expand_icon}>
                {is_expanded ? '▼' : '▶'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bulk Actions - only show when section is expanded and has timers */}
        {is_expanded && timer_count > 0 && render_bulk_actions(section)}
        
        {section.is_custom && is_expanded && (
          <Text style={styles.swipe_hint}>💡 Swipe left to delete</Text>
        )}
      </View>
    );
  };

  /**
   * Renders each timer item
   */
  const render_timer_item = ({ item, section }) => {
    const timer_ref = get_timer_ref(item.id);
    
    if (section.is_custom) {
      return (
        <View style={styles.timer_item_container}>
          <SwipeableTimer
            timer={item}
            onComplete={handle_timer_complete}
            onDelete={handle_delete_timer}
            onViewHistory={handle_view_history}
            ref={timer_ref}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.timer_item_container}>
          <Timer
            name={item.name}
            duration={item.duration}
            category={item.category}
            onComplete={() => handle_timer_complete(item.name)}
            onViewHistory={handle_view_history}
            ref={timer_ref}
          />
        </View>
      );
    }
  };

  /**
   * Renders the header component
   */
  const render_header = () => (
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
  );

  /**
   * Renders empty state when no timers
   */
  const render_empty_state = () => (
    <View style={styles.empty_state_container}>
      <Text style={styles.empty_state_text}>
        Tap "Add Timer" to create your custom timers with categories
      </Text>
      <Text style={styles.empty_state_subtext}>
        Once you have custom timers, you can swipe left to delete them
      </Text>
    </View>
  );

  // Show loading indicator while loading timers
  if (is_loading) {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loading_text}>Loading your timers...</Text>
      </View>
    );
  }

  const section_data = prepare_section_data();

  return (
    <View style={styles.container}>
      <SectionList
        sections={section_data}
        keyExtractor={(item) => item.id}
        renderItem={render_timer_item}
        renderSectionHeader={render_section_header}
        ListHeaderComponent={render_header}
        ListEmptyComponent={render_empty_state}
        contentContainerStyle={section_data.length === 0 ? styles.empty_content : null}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
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
    marginBottom: 20,
  },
  screen_title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  debug_button: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 10,
  },
  debug_button_text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  section_header: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 5,
  },
  section_header_main: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  section_header_content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section_title_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timer_count: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  expand_indicator: {
    padding: 5,
  },
  expand_icon: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  bulk_actions_container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  bulk_action_button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  start_all_button: {
    backgroundColor: '#28a745',
  },
  pause_all_button: {
    backgroundColor: '#ffc107',
  },
  reset_all_button: {
    backgroundColor: '#dc3545',
  },
  bulk_action_text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  swipe_hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  timer_item_container: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  empty_content: {
    flexGrow: 1,
  },
  empty_state_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  empty_state_text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  empty_state_subtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 