import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for timers data
const TIMERS_STORAGE_KEY = 'timer_app_timers';

/**
 * Saves timers array to AsyncStorage
 * @param {Array} timers_array - Array of timer objects to save
 * @returns {Promise<boolean>} - True if successful, false if failed
 */
export const save_timers = async (timers_array) => {
  try {
    // Convert timers array to JSON string
    const timers_json = JSON.stringify(timers_array);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(TIMERS_STORAGE_KEY, timers_json);
    
    console.log('Timers saved successfully:', timers_array.length, 'timers');
    return true;
  } catch (error) {
    // Handle errors gracefully
    console.error('Error saving timers to storage:', error);
    return false;
  }
};

/**
 * Loads timers array from AsyncStorage
 * @returns {Promise<Array>} - Array of timer objects, or default timers if failed/empty
 */
export const load_timers = async () => {
  try {
    // Get timers JSON from AsyncStorage
    const timers_json = await AsyncStorage.getItem(TIMERS_STORAGE_KEY);
    
    if (timers_json === null) {
      // No data found, return default timers
      console.log('No saved timers found, returning default timers');
      return get_default_timers();
    }
    
    // Parse JSON and return timers array
    const timers_array = JSON.parse(timers_json);
    console.log('Timers loaded successfully:', timers_array.length, 'timers');
    return timers_array;
  } catch (error) {
    // Handle errors gracefully - return default timers
    console.error('Error loading timers from storage:', error);
    console.log('Falling back to default timers');
    return get_default_timers();
  }
};

/**
 * Clears all saved timers from storage
 * @returns {Promise<boolean>} - True if successful, false if failed
 */
export const clear_timers = async () => {
  try {
    await AsyncStorage.removeItem(TIMERS_STORAGE_KEY);
    console.log('Timers cleared from storage');
    return true;
  } catch (error) {
    console.error('Error clearing timers from storage:', error);
    return false;
  }
};

/**
 * Gets the default timers array
 * @returns {Array} - Default timers array
 */
const get_default_timers = () => {
  return [
    {
      id: 'default-1',
      name: '1 Minute Timer',
      duration: 60,
      is_default: true,
    },
    {
      id: 'default-2', 
      name: '2 Minute Timer',
      duration: 120,
      is_default: true,
    },
    {
      id: 'default-3',
      name: '5 Minute Timer', 
      duration: 300,
      is_default: true,
    },
  ];
};

/**
 * Checks if storage is available and working
 * @returns {Promise<boolean>} - True if storage is working, false otherwise
 */
export const test_storage = async () => {
  try {
    const test_key = 'timer_app_test';
    const test_value = 'test_data';
    
    // Try to save and retrieve test data
    await AsyncStorage.setItem(test_key, test_value);
    const retrieved_value = await AsyncStorage.getItem(test_key);
    await AsyncStorage.removeItem(test_key);
    
    return retrieved_value === test_value;
  } catch (error) {
    console.error('Storage test failed:', error);
    return false;
  }
}; 