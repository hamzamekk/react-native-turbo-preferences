// Mock the module before importing
jest.mock('../NativeTurboPreferences', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    getAll: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    setMultiple: jest.fn(),
    getMultiple: jest.fn(),
    clearMultiple: jest.fn(),
    contains: jest.fn(),
    reloadWidgets: jest.fn(),
    setBoolean: jest.fn(),
    getBoolean: jest.fn(),
    setInt: jest.fn(),
    getInt: jest.fn(),
    setDouble: jest.fn(),
    getDouble: jest.fn(),
    onPreferenceChange: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

import {
  setName,
  get,
  getAll,
  set,
  clear,
  clearAll,
  setMultiple,
  getMultiple,
  clearMultiple,
  contains,
  reloadWidgets,
  setBoolean,
  getBoolean,
  setInt,
  getInt,
  setDouble,
  getDouble,
  addPreferenceChangeListener,
} from '../index';

// Get the mocked module
const mockModule = require('../NativeTurboPreferences').default;

describe('React Native Turbo Preferences', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await setName(null);
  });

  describe('setName (deprecated global store)', () => {
    it('should route subsequent calls to the selected store', async () => {
      mockModule.get.mockResolvedValue('dark');

      await setName('user_123_preferences');
      await get('theme');

      expect(mockModule.get).toHaveBeenCalledWith(
        'user_123_preferences',
        'theme'
      );
    });

    it('should route to an app group namespace (iOS)', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await setName('group.com.myapp.shared');
      await set('streak', '42');

      expect(mockModule.set).toHaveBeenCalledWith(
        'group.com.myapp.shared',
        'streak',
        '42'
      );
    });

    it('should reset to the default store with an empty string', async () => {
      mockModule.get.mockResolvedValue(null);

      await setName('some_namespace');
      await setName('');
      await get('theme');

      expect(mockModule.get).toHaveBeenCalledWith(null, 'theme');
    });

    it('should reset to the default store with null', async () => {
      mockModule.get.mockResolvedValue(null);

      await setName('some_namespace');
      await setName(null as any);
      await get('theme');

      expect(mockModule.get).toHaveBeenCalledWith(null, 'theme');
    });
  });

  describe('get', () => {
    it('should retrieve user settings', async () => {
      const expectedValue = 'dark';
      mockModule.get.mockResolvedValue(expectedValue);

      const result = await get('theme');

      expect(mockModule.get).toHaveBeenCalledWith(null, 'theme');
      expect(result).toBe(expectedValue);
    });

    it('should handle non-existent keys', async () => {
      mockModule.get.mockResolvedValue(null);

      const result = await get('non_existent_key');

      expect(mockModule.get).toHaveBeenCalledWith(null, 'non_existent_key');
      expect(result).toBe(null);
    });

    it('should retrieve complex data as JSON string', async () => {
      const userData = {
        name: 'John',
        age: 30,
        preferences: { theme: 'dark' },
      };
      const jsonString = JSON.stringify(userData);
      mockModule.get.mockResolvedValue(jsonString);

      const result = await get('user_profile');

      expect(mockModule.get).toHaveBeenCalledWith(null, 'user_profile');
      expect(result).toBe(jsonString);
      expect(JSON.parse(result!)).toEqual(userData);
    });

    it('should handle empty string values', async () => {
      mockModule.get.mockResolvedValue('');

      const result = await get('empty_value_key');

      expect(mockModule.get).toHaveBeenCalledWith(null, 'empty_value_key');
      expect(result).toBe('');
    });
  });

  describe('set', () => {
    it('should store user preferences', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await set('language', 'en');

      expect(mockModule.set).toHaveBeenCalledWith(null, 'language', 'en');
    });

    it('should store complex data as JSON', async () => {
      const userSettings = {
        theme: 'dark',
        notifications: true,
        autoSave: false,
        lastSync: new Date().toISOString(),
      };
      mockModule.set.mockResolvedValue(undefined);

      await set('user_settings', JSON.stringify(userSettings));

      expect(mockModule.set).toHaveBeenCalledWith(
        null,
        'user_settings',
        JSON.stringify(userSettings)
      );
    });

    it('should handle empty string values', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await set('empty_key', '');

      expect(mockModule.set).toHaveBeenCalledWith(null, 'empty_key', '');
    });

    it('should store numeric values as strings', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await set('max_retries', '3');
      await set('timeout', '5000');

      expect(mockModule.set).toHaveBeenCalledWith(null, 'max_retries', '3');
      expect(mockModule.set).toHaveBeenCalledWith(null, 'timeout', '5000');
    });
  });

  describe('clear', () => {
    it('should remove specific user preference', async () => {
      mockModule.clear.mockResolvedValue(undefined);

      await clear('temporary_token');

      expect(mockModule.clear).toHaveBeenCalledWith(null, 'temporary_token');
    });

    it('should handle clearing non-existent keys gracefully', async () => {
      mockModule.clear.mockResolvedValue(undefined);

      await clear('non_existent_key');

      expect(mockModule.clear).toHaveBeenCalledWith(null, 'non_existent_key');
    });
  });

  describe('contains', () => {
    it('should check if user preference exists', async () => {
      mockModule.contains.mockResolvedValue(true);

      const exists = await contains('user_id');

      expect(mockModule.contains).toHaveBeenCalledWith(null, 'user_id');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      mockModule.contains.mockResolvedValue(false);

      const exists = await contains('non_existent_key');

      expect(mockModule.contains).toHaveBeenCalledWith(
        null,
        'non_existent_key'
      );
      expect(exists).toBe(false);
    });

    it('should check for required configuration keys', async () => {
      mockModule.contains.mockResolvedValue(true);

      const hasConfig = await contains('app_config');

      expect(mockModule.contains).toHaveBeenCalledWith(null, 'app_config');
      expect(hasConfig).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should retrieve all user preferences', async () => {
      const allPrefs = {
        theme: 'dark',
        language: 'en',
        notifications: 'true',
        auto_save: 'false',
        last_login: '2024-01-15T10:30:00Z',
      };
      mockModule.getAll.mockResolvedValue(allPrefs);

      const result = await getAll();

      expect(mockModule.getAll).toHaveBeenCalled();
      expect(result).toEqual(allPrefs);
    });

    it('should handle empty store', async () => {
      mockModule.getAll.mockResolvedValue({});

      const result = await getAll();

      expect(mockModule.getAll).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should retrieve app configuration', async () => {
      const appConfig = {
        version: '1.0.0',
        build_number: '123',
        api_endpoint: 'https://api.myapp.com',
        debug_mode: 'false',
      };
      mockModule.getAll.mockResolvedValue(appConfig);

      const result = await getAll();

      expect(mockModule.getAll).toHaveBeenCalled();
      expect(result).toEqual(appConfig);
    });
  });

  describe('clearAll', () => {
    it('should clear all user data on logout', async () => {
      mockModule.clearAll.mockResolvedValue(undefined);

      await clearAll();

      expect(mockModule.clearAll).toHaveBeenCalled();
    });

    it('should clear app data on reset', async () => {
      mockModule.clearAll.mockResolvedValue(undefined);

      await clearAll();

      expect(mockModule.clearAll).toHaveBeenCalled();
    });
  });

  describe('setMultiple', () => {
    it('should store user profile data in batch', async () => {
      const profileData = [
        { key: 'first_name', value: 'John' },
        { key: 'last_name', value: 'Doe' },
        { key: 'email', value: 'john.doe@example.com' },
        { key: 'phone', value: '+1234567890' },
      ];
      mockModule.setMultiple.mockResolvedValue(undefined);

      await setMultiple(profileData);

      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, profileData);
    });

    it('should store app configuration in batch', async () => {
      const configData = [
        { key: 'api_url', value: 'https://api.myapp.com' },
        { key: 'timeout', value: '30000' },
        { key: 'retry_count', value: '3' },
        { key: 'cache_enabled', value: 'true' },
      ];
      mockModule.setMultiple.mockResolvedValue(undefined);

      await setMultiple(configData);

      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, configData);
    });

    it('should handle empty batch gracefully', async () => {
      mockModule.setMultiple.mockResolvedValue(undefined);

      await setMultiple([]);

      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, []);
    });
  });

  describe('getMultiple', () => {
    it('should retrieve user profile data in batch', async () => {
      const keys = ['first_name', 'last_name', 'email', 'phone'];
      const expectedData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
      };
      mockModule.getMultiple.mockResolvedValue(expectedData);

      const result = await getMultiple(keys);

      expect(mockModule.getMultiple).toHaveBeenCalledWith(null, keys);
      expect(result).toEqual(expectedData);
    });

    it('should handle mixed existing and non-existing keys', async () => {
      const keys = ['existing_key', 'non_existing_key', 'another_existing'];
      const expectedData = {
        existing_key: 'value1',
        non_existing_key: null,
        another_existing: 'value2',
      };
      mockModule.getMultiple.mockResolvedValue(expectedData);

      const result = await getMultiple(keys);

      expect(mockModule.getMultiple).toHaveBeenCalledWith(null, keys);
      expect(result).toEqual(expectedData);
    });

    it('should retrieve app settings in batch', async () => {
      const keys = ['theme', 'language', 'notifications', 'auto_save'];
      const expectedData = {
        theme: 'dark',
        language: 'en',
        notifications: 'true',
        auto_save: 'false',
      };
      mockModule.getMultiple.mockResolvedValue(expectedData);

      const result = await getMultiple(keys);

      expect(mockModule.getMultiple).toHaveBeenCalledWith(null, keys);
      expect(result).toEqual(expectedData);
    });
  });

  describe('clearMultiple', () => {
    it('should clear temporary user data in batch', async () => {
      const keysToClear = [
        'temp_token',
        'session_id',
        'cache_data',
        'temp_files',
      ];
      mockModule.clearMultiple.mockResolvedValue(undefined);

      await clearMultiple(keysToClear);

      expect(mockModule.clearMultiple).toHaveBeenCalledWith(null, keysToClear);
    });

    it('should clear app cache data in batch', async () => {
      const cacheKeys = [
        'image_cache',
        'api_cache',
        'user_cache',
        'config_cache',
      ];
      mockModule.clearMultiple.mockResolvedValue(undefined);

      await clearMultiple(cacheKeys);

      expect(mockModule.clearMultiple).toHaveBeenCalledWith(null, cacheKeys);
    });

    it('should handle empty keys array gracefully', async () => {
      mockModule.clearMultiple.mockResolvedValue(undefined);

      await clearMultiple([]);

      expect(mockModule.clearMultiple).toHaveBeenCalledWith(null, []);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user registration flow', async () => {
      // 1. Set user namespace
      await setName('user_456');

      // 2. Store user profile
      const profileData = [
        { key: 'username', value: 'johndoe' },
        { key: 'email', value: 'john@example.com' },
        { key: 'created_at', value: new Date().toISOString() },
      ];
      mockModule.setMultiple.mockResolvedValue(undefined);
      await setMultiple(profileData);
      expect(mockModule.setMultiple).toHaveBeenCalledWith(
        'user_456',
        profileData
      );

      // 3. Verify profile was stored
      const profileKeys = ['username', 'email', 'created_at'];
      const expectedProfile = {
        username: 'johndoe',
        email: 'john@example.com',
        created_at: expect.any(String),
      };
      mockModule.getMultiple.mockResolvedValue(expectedProfile);
      const storedProfile = await getMultiple(profileKeys);
      expect(mockModule.getMultiple).toHaveBeenCalledWith(
        'user_456',
        profileKeys
      );
      expect(storedProfile).toEqual(expectedProfile);
    });

    it('should handle app configuration management', async () => {
      // 1. Store app config
      const configData = [
        { key: 'api_version', value: 'v2' },
        { key: 'debug_mode', value: 'false' },
        { key: 'analytics_enabled', value: 'true' },
      ];
      mockModule.setMultiple.mockResolvedValue(undefined);
      await setMultiple(configData);
      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, configData);

      // 2. Retrieve specific config
      mockModule.get.mockResolvedValue('v2');
      const apiVersion = await get('api_version');
      expect(mockModule.get).toHaveBeenCalledWith(null, 'api_version');
      expect(apiVersion).toBe('v2');

      // 3. Check if config exists
      mockModule.contains.mockResolvedValue(true);
      const hasConfig = await contains('debug_mode');
      expect(mockModule.contains).toHaveBeenCalledWith(null, 'debug_mode');
      expect(hasConfig).toBe(true);
    });

    it('should handle user preferences with namespace switching', async () => {
      // 1. Set default namespace preferences
      mockModule.set.mockResolvedValue(undefined);
      await set('default_theme', 'light');
      expect(mockModule.set).toHaveBeenCalledWith(
        null,
        'default_theme',
        'light'
      );

      // 2. Switch to user namespace
      await setName('user_789');

      // 3. Set user-specific preferences
      await set('theme', 'dark');
      expect(mockModule.set).toHaveBeenCalledWith('user_789', 'theme', 'dark');

      // 4. Switch back to default
      await setName('');

      // 5. Verify default preferences still exist
      mockModule.get.mockResolvedValue('light');
      const defaultTheme = await get('default_theme');
      expect(mockModule.get).toHaveBeenCalledWith(null, 'default_theme');
      expect(defaultTheme).toBe('light');
    });

    it('should handle data cleanup and reset scenarios', async () => {
      // 1. Store some data
      const testData = [
        { key: 'temp_file_1', value: 'content1' },
        { key: 'temp_file_2', value: 'content2' },
        { key: 'cache_data', value: 'cached_content' },
      ];
      mockModule.setMultiple.mockResolvedValue(undefined);
      await setMultiple(testData);
      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, testData);

      // 2. Clear specific temporary files
      const tempKeys = ['temp_file_1', 'temp_file_2'];
      mockModule.clearMultiple.mockResolvedValue(undefined);
      await clearMultiple(tempKeys);
      expect(mockModule.clearMultiple).toHaveBeenCalledWith(null, tempKeys);

      // 3. Clear all remaining data
      mockModule.clearAll.mockResolvedValue(undefined);
      await clearAll();
      expect(mockModule.clearAll).toHaveBeenCalled();
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle storage full errors gracefully', async () => {
      const storageError = new Error('Storage full');
      mockModule.set.mockRejectedValue(storageError);

      await expect(set('large_data', 'x'.repeat(1000000))).rejects.toThrow(
        'Storage full'
      );
      expect(mockModule.set).toHaveBeenCalledWith(
        null,
        'large_data',
        'x'.repeat(1000000)
      );
    });

    it('should handle permission errors gracefully', async () => {
      const permissionError = new Error('Permission denied');
      mockModule.get.mockRejectedValue(permissionError);

      await expect(get('restricted_key')).rejects.toThrow('Permission denied');
      expect(mockModule.get).toHaveBeenCalledWith(null, 'restricted_key');
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      mockModule.setMultiple.mockRejectedValue(networkError);

      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        key: `key_${i}`,
        value: `value_${i}`,
      }));

      await expect(setMultiple(largeData)).rejects.toThrow('Network timeout');
      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, largeData);
    });
  });

  describe('Performance Scenarios', () => {
    it('should handle large batch operations efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        key: `large_key_${i}`,
        value: `large_value_${i}`,
      }));
      mockModule.setMultiple.mockResolvedValue(undefined);

      const startTime = performance.now();
      await setMultiple(largeDataset);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(mockModule.setMultiple).toHaveBeenCalledWith(null, largeDataset);
    });

    it('should handle rapid namespace switching', async () => {
      const namespaces = Array.from({ length: 100 }, (_, i) => `ns_${i}`);
      mockModule.get.mockResolvedValue(null);

      const startTime = performance.now();
      for (const ns of namespaces) {
        await setName(ns);
        await get('key');
      }
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(mockModule.get).toHaveBeenCalledTimes(100);
      expect(mockModule.get).toHaveBeenLastCalledWith('ns_99', 'key');
    });
  });

  describe('typed values', () => {
    it('should set and get a boolean', async () => {
      mockModule.setBoolean.mockResolvedValue(undefined);
      mockModule.getBoolean.mockResolvedValue(true);

      await setBoolean('darkMode', true);
      const value = await getBoolean('darkMode');

      expect(mockModule.setBoolean).toHaveBeenCalledWith(
        null,
        'darkMode',
        true
      );
      expect(value).toBe(true);
    });

    it('should set and get an int', async () => {
      mockModule.setInt.mockResolvedValue(undefined);
      mockModule.getInt.mockResolvedValue(42);

      await setInt('streak', 42);
      const value = await getInt('streak');

      expect(mockModule.setInt).toHaveBeenCalledWith(null, 'streak', 42);
      expect(value).toBe(42);
    });

    it('should reject setInt with a non-integer', async () => {
      await expect(setInt('streak', 3.5)).rejects.toThrow(
        /expects a 32-bit integer/
      );
      expect(mockModule.setInt).not.toHaveBeenCalled();
    });

    it('should reject setInt outside the 32-bit range', async () => {
      await expect(setInt('streak', 2147483648)).rejects.toThrow(
        /expects a 32-bit integer/
      );
      await expect(setInt('streak', -2147483649)).rejects.toThrow(
        /expects a 32-bit integer/
      );
      expect(mockModule.setInt).not.toHaveBeenCalled();
    });

    it('should accept setInt at the 32-bit boundaries', async () => {
      mockModule.setInt.mockResolvedValue(undefined);

      await setInt('max', 2147483647);
      await setInt('min', -2147483648);

      expect(mockModule.setInt).toHaveBeenCalledWith(null, 'max', 2147483647);
      expect(mockModule.setInt).toHaveBeenCalledWith(null, 'min', -2147483648);
    });

    it('should set and get a double', async () => {
      mockModule.setDouble.mockResolvedValue(undefined);
      mockModule.getDouble.mockResolvedValue(3.14);

      await setDouble('ratio', 3.14);
      const value = await getDouble('ratio');

      expect(mockModule.setDouble).toHaveBeenCalledWith(null, 'ratio', 3.14);
      expect(value).toBe(3.14);
    });

    it('should resolve null for missing typed keys', async () => {
      mockModule.getBoolean.mockResolvedValue(null);
      mockModule.getInt.mockResolvedValue(null);
      mockModule.getDouble.mockResolvedValue(null);

      expect(await getBoolean('missing')).toBeNull();
      expect(await getInt('missing')).toBeNull();
      expect(await getDouble('missing')).toBeNull();
    });
  });

  describe('addPreferenceChangeListener', () => {
    it('should subscribe through the native event emitter', () => {
      const listener = jest.fn();

      const subscription = addPreferenceChangeListener(listener);

      expect(mockModule.onPreferenceChange).toHaveBeenCalledWith(listener);
      expect(typeof subscription.remove).toBe('function');
    });

    it('should deliver change events to the listener', () => {
      let captured: ((event: { key?: string | null }) => void) | undefined;
      mockModule.onPreferenceChange.mockImplementation(
        (cb: (event: { key?: string | null }) => void) => {
          captured = cb;
          return { remove: jest.fn() };
        }
      );
      const listener = jest.fn();

      addPreferenceChangeListener(listener);
      captured?.({ key: 'theme' });

      expect(listener).toHaveBeenCalledWith({ key: 'theme' });
    });
  });

  describe('createStore', () => {
    const { createStore } = require('../index');

    it('should route calls to the named store', async () => {
      mockModule.set.mockResolvedValue(undefined);
      mockModule.getInt.mockResolvedValue(42);

      const appGroup = createStore('group.com.myapp.shared');
      await appGroup.set('lastWorkout', 'Push day');
      const streak = await appGroup.getInt('streak');

      expect(appGroup.name).toBe('group.com.myapp.shared');
      expect(mockModule.set).toHaveBeenCalledWith(
        'group.com.myapp.shared',
        'lastWorkout',
        'Push day'
      );
      expect(mockModule.getInt).toHaveBeenCalledWith(
        'group.com.myapp.shared',
        'streak'
      );
      expect(streak).toBe(42);
    });

    it('should route to the default store when created without a name', async () => {
      mockModule.get.mockResolvedValue('dark');

      const defaults = createStore();
      await defaults.get('theme');

      expect(defaults.name).toBeNull();
      expect(mockModule.get).toHaveBeenCalledWith(null, 'theme');
    });

    it('should allow two stores side by side without global state', async () => {
      mockModule.set.mockResolvedValue(undefined);

      const a = createStore('store_a');
      const b = createStore('store_b');
      await a.set('k', '1');
      await b.set('k', '2');
      await a.set('k2', '3');

      expect(mockModule.set).toHaveBeenNthCalledWith(1, 'store_a', 'k', '1');
      expect(mockModule.set).toHaveBeenNthCalledWith(2, 'store_b', 'k', '2');
      expect(mockModule.set).toHaveBeenNthCalledWith(3, 'store_a', 'k2', '3');
    });

    it('should validate setInt on store handles', async () => {
      const store = createStore('store_a');

      await expect(store.setInt('n', 1.5)).rejects.toThrow(
        /expects a 32-bit integer/
      );
      expect(mockModule.setInt).not.toHaveBeenCalled();
    });

    it('should filter store.addListener events to its own store', () => {
      let captured: ((event: any) => void) | undefined;
      mockModule.onPreferenceChange.mockImplementation((cb: any) => {
        captured = cb;
        return { remove: jest.fn() };
      });
      const listener = jest.fn();

      const store = createStore('store_a');
      store.addListener(listener);

      captured?.({ key: 'k', store: 'store_b' });
      expect(listener).not.toHaveBeenCalled();

      captured?.({ key: 'k', store: 'store_a' });
      expect(listener).toHaveBeenCalledWith({ key: 'k', store: 'store_a' });
    });

    it('should match null-store events for the default store handle', () => {
      let captured: ((event: any) => void) | undefined;
      mockModule.onPreferenceChange.mockImplementation((cb: any) => {
        captured = cb;
        return { remove: jest.fn() };
      });
      const listener = jest.fn();

      createStore().addListener(listener);
      captured?.({ key: 'k', store: null });

      expect(listener).toHaveBeenCalledWith({ key: 'k', store: null });
    });
  });

  describe('reloadWidgets', () => {
    it('should reload all widget timelines when no kind is passed', async () => {
      mockModule.reloadWidgets.mockResolvedValue(undefined);

      await reloadWidgets();

      expect(mockModule.reloadWidgets).toHaveBeenCalledWith(null);
    });

    it('should reload a specific widget kind', async () => {
      mockModule.reloadWidgets.mockResolvedValue(undefined);

      await reloadWidgets('StreakWidget');

      expect(mockModule.reloadWidgets).toHaveBeenCalledWith('StreakWidget');
    });

    it('should propagate native errors', async () => {
      mockModule.reloadWidgets.mockRejectedValue(
        new Error('E_WIDGETS_UNAVAILABLE')
      );

      await expect(reloadWidgets()).rejects.toThrow('E_WIDGETS_UNAVAILABLE');
    });
  });
});
