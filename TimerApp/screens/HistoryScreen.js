import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  load_history, 
  clear_history, 
  group_history_by_date, 
  get_today_completion_count, 
  get_today_total_time,
  format_completion_time,
  format_duration
} from '../utils/history';

/**
 * HistoryScreen component - displays completed timer history
 * Shows timers grouped by date with statistics and clear functionality
 */
export default function HistoryScreen() {
  // State for history data and loading
  const [history_data, set_history_data] = useState([]);
  const [raw_history, set_raw_history] = useState([]);
  const [is_loading, set_is_loading] = useState(true);
  const [is_refreshing, set_is_refreshing] = useState(false);

  /**
   * Loads history data from storage
   */
  const load_history_data = async () => {
    try {
      console.log(`🔄 HistoryScreen: Loading history data...`);
      set_is_loading(true);
      const history = await load_history();
      console.log(`📊 HistoryScreen: Loaded ${history.length} history entries`);
      set_raw_history(history);
      
      const grouped_history = group_history_by_date(history);
      console.log(`📂 HistoryScreen: Grouped into ${grouped_history.length} sections`);
      set_history_data(grouped_history);
    } catch (error) {
      console.error('💥 HistoryScreen: Error loading history:', error);
      Alert.alert(
        'Loading Error',
        'Failed to load timer history. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      set_is_loading(false);
    }
  };

  /**
   * Handles refresh action
   */
  const handle_refresh = async () => {
    set_is_refreshing(true);
    await load_history_data();
    set_is_refreshing(false);
  };

  /**
   * Handles clearing all history with confirmation
   */
  const handle_clear_history = () => {
    if (raw_history.length === 0) {
      Alert.alert('No History', 'There is no history to clear.');
      return;
    }

    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all timer history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clear_history();
              if (success) {
                set_history_data([]);
                set_raw_history([]);
                Alert.alert(
                  'History Cleared',
                  'All timer history has been successfully cleared.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to clear history. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert(
                'Error',
                'An error occurred while clearing history.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Renders a single history item
   */
  const render_history_item = ({ item }) => {
    return (
      <View style={styles.history_item}>
        <View style={styles.item_header}>
          <Text style={styles.timer_name}>{item.timer_name}</Text>
          <Text style={styles.completion_time}>
            {format_completion_time(item.completion_time)}
          </Text>
        </View>
        
        <View style={styles.item_details}>
          <View style={styles.duration_container}>
            <Text style={styles.duration_label}>Duration:</Text>
            <Text style={styles.duration_value}>
              {format_duration(item.original_duration)}
            </Text>
          </View>
          
          {item.category && (
            <View style={styles.category_container}>
              <Text style={styles.category_label}>Category:</Text>
              <View style={styles.category_badge}>
                <Text style={styles.category_text}>{item.category}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  /**
   * Renders section header (date)
   */
  const render_section_header = ({ section }) => {
    const entries_count = section.data.length;
    const total_time = section.data.reduce((sum, entry) => sum + entry.original_duration, 0);
    
    return (
      <View style={styles.section_header}>
        <View style={styles.section_header_main}>
          <Text style={styles.section_title}>{section.title}</Text>
          <View style={styles.section_stats}>
            <Text style={styles.section_count}>
              {entries_count} timer{entries_count !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.section_total_time}>
              {format_duration(total_time)} total
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Renders header with statistics and clear button
   */
  const render_header = () => {
    const today_count = get_today_completion_count(raw_history);
    const today_total_time = get_today_total_time(raw_history);
    const total_timers = raw_history.length;

    return (
      <View style={styles.header}>
        <Text style={styles.screen_title}>Timer History</Text>
        
        {/* Today's Statistics */}
        {today_count > 0 && (
          <View style={styles.today_stats}>
            <Text style={styles.today_stats_title}>Today's Progress</Text>
            <View style={styles.stats_row}>
              <View style={styles.stat_item}>
                <Text style={styles.stat_value}>{today_count}</Text>
                <Text style={styles.stat_label}>
                  Timer{today_count !== 1 ? 's' : ''} Completed
                </Text>
              </View>
              <View style={styles.stat_divider} />
              <View style={styles.stat_item}>
                <Text style={styles.stat_value}>{format_duration(today_total_time)}</Text>
                <Text style={styles.stat_label}>Total Time</Text>
              </View>
            </View>
          </View>
        )}

        {/* Total Statistics */}
        {total_timers > 0 && (
          <View style={styles.total_stats}>
            <Text style={styles.total_stats_text}>
              📊 {total_timers} total timer{total_timers !== 1 ? 's' : ''} completed
            </Text>
          </View>
        )}

        {/* Test Add History Button */}
        <TouchableOpacity
          style={styles.test_button}
          onPress={async () => {
            console.log(`🧪 Test: Adding test timer to history...`);
            const { add_timer_to_history } = require('../utils/history');
            const success = await add_timer_to_history('Test Timer', 60, 'Test');
            console.log(`🧪 Test result: ${success ? 'Success' : 'Failed'}`);
            if (success) {
              await load_history_data();
            }
          }}
        >
          <Text style={styles.test_button_text}>🧪 Test Add History</Text>
        </TouchableOpacity>

        {/* Clear History Button */}
        {total_timers > 0 && (
          <TouchableOpacity
            style={styles.clear_button}
            onPress={handle_clear_history}
          >
            <Text style={styles.clear_button_text}>🗑️ Clear History</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Renders empty state when no history exists
   */
  const render_empty_state = () => (
    <View style={styles.empty_state_container}>
      <Text style={styles.empty_state_emoji}>📈</Text>
      <Text style={styles.empty_state_title}>No Timer History</Text>
      <Text style={styles.empty_state_message}>
        Complete some timers to see your progress here.
      </Text>
      <Text style={styles.empty_state_subtitle}>
        Your completed timers will be automatically tracked and organized by date.
      </Text>
    </View>
  );

  // Load history data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log(`🎯 HistoryScreen: Screen focused, loading history data...`);
      load_history_data();
    }, [])
  );

  // Show loading indicator
  if (is_loading) {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loading_text}>Loading your timer history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={history_data}
        keyExtractor={(item) => item.id}
        renderItem={render_history_item}
        renderSectionHeader={render_section_header}
        ListHeaderComponent={render_header}
        ListEmptyComponent={render_empty_state}
        contentContainerStyle={history_data.length === 0 ? styles.empty_content : null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={is_refreshing}
            onRefresh={handle_refresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
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
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  screen_title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  today_stats: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  today_stats_title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  stats_row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat_item: {
    flex: 1,
    alignItems: 'center',
  },
  stat_value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  stat_label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  stat_divider: {
    width: 1,
    height: 40,
    backgroundColor: '#4CAF50',
    marginHorizontal: 15,
  },
  total_stats: {
    alignItems: 'center',
    marginBottom: 15,
  },
  total_stats_text: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  test_button: {
    backgroundColor: '#6f42c1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  test_button_text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clear_button: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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
  clear_button_text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section_header: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  section_header_main: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  section_stats: {
    flexDirection: 'row',
    gap: 15,
  },
  section_count: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section_total_time: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  history_item: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  item_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timer_name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  completion_time: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  item_details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  duration_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration_label: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  duration_value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  category_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category_label: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  category_badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  category_text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
  empty_state_emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  empty_state_title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  empty_state_message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  empty_state_subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
}); 