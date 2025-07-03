import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { use_theme } from '../contexts/ThemeContext';
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
  // Get theme context
  const { theme } = use_theme();
  
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
      <View style={[styles.history_item, { 
        backgroundColor: theme.card_background,
        shadowColor: theme.shadow_color,
        borderLeftColor: theme.button_success 
      }]}>
        <View style={styles.item_header}>
          <Text style={[styles.timer_name, { color: theme.text_primary }]}>{item.timer_name}</Text>
          <Text style={[styles.completion_time, { color: theme.text_secondary }]}>
            {format_completion_time(item.completion_time)}
          </Text>
        </View>
        
        <View style={styles.item_details}>
          <View style={styles.duration_container}>
            <Text style={[styles.duration_label, { color: theme.text_secondary }]}>Duration:</Text>
            <Text style={[styles.duration_value, { color: theme.button_success }]}>
              {format_duration(item.original_duration)}
            </Text>
          </View>
          
          {item.category && (
            <View style={styles.category_container}>
              <Text style={[styles.category_label, { color: theme.text_secondary }]}>Category:</Text>
              <View style={[styles.category_badge, { backgroundColor: theme.button_primary }]}>
                <Text style={[styles.category_text, { color: theme.text_inverse }]}>{item.category}</Text>
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
      <View style={[styles.section_header, { 
        backgroundColor: theme.section_header_background, 
        borderBottomColor: theme.border_primary 
      }]}>
        <View style={styles.section_header_main}>
          <Text style={[styles.section_title, { color: theme.text_primary }]}>{section.title}</Text>
          <View style={styles.section_stats}>
            <Text style={[styles.section_count, { color: theme.text_secondary }]}>
              {entries_count} timer{entries_count !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.section_total_time, { color: theme.button_primary }]}>
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
      <View style={[styles.header, { 
        backgroundColor: theme.background_secondary, 
        borderBottomColor: theme.border_primary 
      }]}>
        <Text style={[styles.screen_title, { color: theme.text_primary }]}>Timer History</Text>
        
        {/* Today's Statistics */}
        {today_count > 0 && (
          <View style={[styles.today_stats, { 
            backgroundColor: theme.stats_background, 
            borderLeftColor: theme.stats_border 
          }]}>
            <Text style={[styles.today_stats_title, { color: theme.stats_text }]}>Today's Progress</Text>
            <View style={styles.stats_row}>
              <View style={styles.stat_item}>
                <Text style={[styles.stat_value, { color: theme.stats_text }]}>{today_count}</Text>
                <Text style={[styles.stat_label, { color: theme.text_secondary }]}>
                  Timer{today_count !== 1 ? 's' : ''} Completed
                </Text>
              </View>
              <View style={[styles.stat_divider, { backgroundColor: theme.stats_border }]} />
              <View style={styles.stat_item}>
                <Text style={[styles.stat_value, { color: theme.stats_text }]}>{format_duration(today_total_time)}</Text>
                <Text style={[styles.stat_label, { color: theme.text_secondary }]}>Total Time</Text>
              </View>
            </View>
          </View>
        )}

        {/* Total Statistics */}
        {total_timers > 0 && (
          <View style={styles.total_stats}>
            <Text style={[styles.total_stats_text, { color: theme.text_secondary }]}>
              📊 {total_timers} total timer{total_timers !== 1 ? 's' : ''} completed
            </Text>
          </View>
        )}



        {/* Clear History Button */}
        {total_timers > 0 && (
          <TouchableOpacity
            style={[styles.clear_button, { 
              backgroundColor: theme.button_danger,
              shadowColor: theme.shadow_color 
            }]}
            onPress={handle_clear_history}
          >
            <Text style={[styles.clear_button_text, { color: theme.text_inverse }]}>🗑️ Clear History</Text>
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
      <Text style={[styles.empty_state_title, { color: theme.text_primary }]}>No Timer History</Text>
      <Text style={[styles.empty_state_message, { color: theme.text_secondary }]}>
        Complete some timers to see your progress here.
      </Text>
      <Text style={[styles.empty_state_subtitle, { color: theme.text_tertiary }]}>
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
      <View style={[styles.loading_container, { backgroundColor: theme.background_primary }]}>
        <ActivityIndicator size="large" color={theme.button_primary} />
        <Text style={[styles.loading_text, { color: theme.text_secondary }]}>Loading your timer history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background_primary }]}>
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
            colors={[theme.button_primary]}
            tintColor={theme.button_primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading_text: {
    marginTop: 15,
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  screen_title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  today_stats: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  today_stats_title: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  stat_label: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  stat_divider: {
    width: 1,
    height: 40,
    marginHorizontal: 15,
  },
  total_stats: {
    alignItems: 'center',
    marginBottom: 15,
  },
  total_stats_text: {
    fontSize: 14,
    fontStyle: 'italic',
  },

  clear_button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clear_button_text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section_header: {
    borderBottomWidth: 1,
  },
  section_header_main: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section_stats: {
    flexDirection: 'row',
    gap: 15,
  },
  section_count: {
    fontSize: 14,
    fontWeight: '500',
  },
  section_total_time: {
    fontSize: 14,
    fontWeight: '500',
  },
  history_item: {
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
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
    flex: 1,
    marginRight: 10,
  },
  completion_time: {
    fontSize: 14,
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
    marginRight: 5,
  },
  duration_value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  category_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category_label: {
    fontSize: 12,
    marginRight: 5,
  },
  category_badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  category_text: {
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
    marginBottom: 15,
    textAlign: 'center',
  },
  empty_state_message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  empty_state_subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
}); 