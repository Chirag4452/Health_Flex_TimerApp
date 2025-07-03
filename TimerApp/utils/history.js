import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for timer history
const HISTORY_STORAGE_KEY = '@TimerApp:history';

/**
 * Represents a completed timer entry
 * @typedef {Object} HistoryEntry
 * @property {string} id - Unique identifier for the entry
 * @property {string} timer_name - Name of the completed timer
 * @property {number} original_duration - Original duration in seconds
 * @property {string} category - Timer category
 * @property {string} completion_time - ISO string of completion time
 * @property {string} completion_date - Date string (YYYY-MM-DD) for grouping
 */

/**
 * Generates a unique ID for history entries
 * @returns {string} - Unique identifier
 */
const generate_history_id = () => {
  return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formats a date to YYYY-MM-DD format for grouping
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const format_date_for_grouping = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Formats a date to a readable format (e.g., "Today", "Yesterday", "March 15, 2024")
 * @param {string} date_string - Date string in YYYY-MM-DD format
 * @returns {string} - Human readable date string
 */
const format_date_for_display = (date_string) => {
  const date = new Date(date_string);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const today_string = format_date_for_grouping(today);
  const yesterday_string = format_date_for_grouping(yesterday);

  if (date_string === today_string) {
    return 'Today';
  } else if (date_string === yesterday_string) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

/**
 * Formats completion time to readable format (e.g., "2:30 PM")
 * @param {string} iso_string - ISO date string
 * @returns {string} - Formatted time string
 */
const format_completion_time = (iso_string) => {
  const date = new Date(iso_string);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats duration in seconds to readable format (e.g., "5m 30s", "1h 15m")
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
const format_duration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining_seconds = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  } else if (minutes > 0) {
    if (remaining_seconds > 0) {
      return `${minutes}m ${remaining_seconds}s`;
    }
    return `${minutes}m`;
  } else {
    return `${remaining_seconds}s`;
  }
};

/**
 * Adds a completed timer to history
 * @param {string} timer_name - Name of the completed timer
 * @param {number} original_duration - Original duration in seconds
 * @param {string} category - Timer category
 * @returns {Promise<boolean>} - Success status
 */
export const add_timer_to_history = async (timer_name, original_duration, category) => {
  try {
    console.log(`🔧 add_timer_to_history called with:`, { timer_name, original_duration, category });
    
    const current_time = new Date();
    const completion_time = current_time.toISOString();
    const completion_date = format_date_for_grouping(current_time);

    const history_entry = {
      id: generate_history_id(),
      timer_name,
      original_duration,
      category: category || 'Uncategorized',
      completion_time,
      completion_date
    };

    console.log(`📝 Created history entry:`, history_entry);

    // Load existing history
    console.log(`📚 Loading existing history...`);
    const existing_history = await load_history();
    console.log(`📚 Loaded ${existing_history.length} existing entries`);
    
    // Add new entry to the beginning (most recent first)
    const updated_history = [history_entry, ...existing_history];
    console.log(`📊 Updated history will have ${updated_history.length} entries`);
    
    // Save updated history
    console.log(`💾 Saving updated history...`);
    const success = await save_history_to_storage(updated_history);
    
    if (success) {
      console.log(`✅ Timer added to history:`, timer_name);
    } else {
      console.warn(`❌ Failed to add timer to history:`, timer_name);
    }
    
    return success;
  } catch (error) {
    console.error('💥 Error adding timer to history:', error);
    return false;
  }
};

/**
 * Loads timer history from AsyncStorage
 * @returns {Promise<Array<HistoryEntry>>} - Array of history entries
 */
export const load_history = async () => {
  try {
    console.log(`🔍 Loading history from storage key: ${HISTORY_STORAGE_KEY}`);
    const history_json = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    
    if (history_json === null) {
      console.log('📭 No history found in storage, returning empty array');
      return [];
    }
    
    console.log(`📥 Found history JSON in storage: ${history_json.substring(0, 100)}...`);
    const history = JSON.parse(history_json);
    
    // Ensure the history is an array
    if (!Array.isArray(history)) {
      console.warn('⚠️ Invalid history format in storage, returning empty array');
      return [];
    }
    
    console.log(`📊 Loaded ${history.length} history entries from storage`);
    return history;
  } catch (error) {
    console.error('💥 Error loading history from storage:', error);
    return [];
  }
};

/**
 * Saves timer history to AsyncStorage
 * @param {Array<HistoryEntry>} history - Array of history entries
 * @returns {Promise<boolean>} - Success status
 */
const save_history_to_storage = async (history) => {
  try {
    console.log(`💾 Attempting to save ${history.length} history entries...`);
    
    // Validate input
    if (!Array.isArray(history)) {
      console.error('❌ Invalid history data: not an array');
      return false;
    }
    
    const history_json = JSON.stringify(history);
    console.log(`📝 Serialized history to JSON: ${history_json.substring(0, 100)}...`);
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, history_json);
    console.log(`✅ Successfully saved ${history.length} history entries to storage`);
    
    return true;
  } catch (error) {
    console.error('💥 Error saving history to storage:', error);
    return false;
  }
};

/**
 * Clears all timer history
 * @returns {Promise<boolean>} - Success status
 */
export const clear_history = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    console.log('History cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

/**
 * Groups history entries by date for display
 * @param {Array<HistoryEntry>} history - Array of history entries
 * @returns {Array<Object>} - Array of grouped sections for SectionList
 */
export const group_history_by_date = (history) => {
  try {
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }
    
    // Group entries by completion_date
    const grouped = history.reduce((groups, entry) => {
      const date = entry.completion_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    }, {});
    
    // Convert to SectionList format and sort by date (most recent first)
    const sections = Object.entries(grouped)
      .sort(([date_a], [date_b]) => date_b.localeCompare(date_a))
      .map(([date, entries]) => ({
        title: format_date_for_display(date),
        date: date,
        data: entries.sort((a, b) => new Date(b.completion_time) - new Date(a.completion_time))
      }));
    
    return sections;
  } catch (error) {
    console.error('Error grouping history by date:', error);
    return [];
  }
};

/**
 * Gets total timers completed today
 * @param {Array<HistoryEntry>} history - Array of history entries
 * @returns {number} - Count of timers completed today
 */
export const get_today_completion_count = (history) => {
  try {
    const today = format_date_for_grouping(new Date());
    return history.filter(entry => entry.completion_date === today).length;
  } catch (error) {
    console.error('Error getting today completion count:', error);
    return 0;
  }
};

/**
 * Gets total time completed today in seconds
 * @param {Array<HistoryEntry>} history - Array of history entries
 * @returns {number} - Total seconds completed today
 */
export const get_today_total_time = (history) => {
  try {
    const today = format_date_for_grouping(new Date());
    return history
      .filter(entry => entry.completion_date === today)
      .reduce((total, entry) => total + entry.original_duration, 0);
  } catch (error) {
    console.error('Error getting today total time:', error);
    return 0;
  }
};

/**
 * Test function to verify history storage functionality
 * @returns {Promise<boolean>} - Test success status
 */
export const test_history_storage = async () => {
  try {
    console.log('Testing history storage...');
    
    // Test adding entries
    await add_timer_to_history('Test Timer 1', 300, 'Work');
    await add_timer_to_history('Test Timer 2', 600, 'Exercise');
    
    // Test loading
    const loaded_history = await load_history();
    console.log('Loaded history:', loaded_history);
    
    // Test grouping
    const grouped = group_history_by_date(loaded_history);
    console.log('Grouped history:', grouped);
    
    // Test clearing
    await clear_history();
    
    console.log('History storage test completed successfully');
    return true;
  } catch (error) {
    console.error('History storage test failed:', error);
    return false;
  }
};

// Export formatting functions for use in components
export {
  format_completion_time,
  format_duration,
  format_date_for_display
}; 