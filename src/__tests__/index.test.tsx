// Mock the module before importing
jest.mock('../NativeTurboPreferences', () => ({
  __esModule: true,
  default: {
    setName: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    setMultiple: jest.fn(),
    getMultiple: jest.fn(),
    clearMultiple: jest.fn(),
    contains: jest.fn(),
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
} from '../index';

// Get the mocked module
const mockModule = require('../NativeTurboPreferences').default;

describe('React Native Turbo Preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setName', () => {
    it('should switch to user-specific namespace', async () => {
      mockModule.setName.mockResolvedValue(undefined);

      await setName('user_123_preferences');

      expect(mockModule.setName).toHaveBeenCalledWith('user_123_preferences');
    });

    it('should switch to app group namespace (iOS)', async () => {
      mockModule.setName.mockResolvedValue(undefined);

      await setName('group.com.myapp.shared');

      expect(mockModule.setName).toHaveBeenCalledWith('group.com.myapp.shared');
    });

    it('should reset to default namespace', async () => {
      mockModule.setName.mockResolvedValue(undefined);

      await setName('');

      expect(mockModule.setName).toHaveBeenCalledWith('');
    });

    it('should handle null namespace', async () => {
      mockModule.setName.mockResolvedValue(undefined);

      await setName(null as any);

      expect(mockModule.setName).toHaveBeenCalledWith(null);
    });
  });

  describe('get', () => {
    it('should retrieve user settings', async () => {
      const expectedValue = 'dark';
      mockModule.get.mockResolvedValue(expectedValue);

      const result = await get('theme');

      expect(mockModule.get).toHaveBeenCalledWith('theme');
      expect(result).toBe(expectedValue);
    });

    it('should handle non-existent keys', async () => {
      mockModule.get.mockResolvedValue(null);

      const result = await get('non_existent_key');

      expect(mockModule.get).toHaveBeenCalledWith('non_existent_key');
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

      expect(mockModule.get).toHaveBeenCalledWith('user_profile');
      expect(result).toBe(jsonString);
      expect(JSON.parse(result!)).toEqual(userData);
    });

    it('should handle empty string values', async () => {
      mockModule.get.mockResolvedValue('');

      const result = await get('empty_value_key');

      expect(mockModule.get).toHaveBeenCalledWith('empty_value_key');
      expect(result).toBe('');
    });
  });

  describe('set', () => {
    it('should store user preferences', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await set('language', 'en');

      expect(mockModule.set).toHaveBeenCalledWith('language', 'en');
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
        'user_settings',
        JSON.stringify(userSettings)
      );
    });

    it('should handle empty string values', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await set('empty_key', '');

      expect(mockModule.set).toHaveBeenCalledWith('empty_key', '');
    });

    it('should store numeric values as strings', async () => {
      mockModule.set.mockResolvedValue(undefined);

      await set('max_retries', '3');
      await set('timeout', '5000');

      expect(mockModule.set).toHaveBeenCalledWith('max_retries', '3');
      expect(mockModule.set).toHaveBeenCalledWith('timeout', '5000');
    });
  });

  describe('clear', () => {
    it('should remove specific user preference', async () => {
      mockModule.clear.mockResolvedValue(undefined);

      await clear('temporary_token');

      expect(mockModule.clear).toHaveBeenCalledWith('temporary_token');
    });

    it('should handle clearing non-existent keys gracefully', async () => {
      mockModule.clear.mockResolvedValue(undefined);

      await clear('non_existent_key');

      expect(mockModule.clear).toHaveBeenCalledWith('non_existent_key');
    });
  });

  describe('contains', () => {
    it('should check if user preference exists', async () => {
      mockModule.contains.mockResolvedValue(true);

      const exists = await contains('user_id');

      expect(mockModule.contains).toHaveBeenCalledWith('user_id');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      mockModule.contains.mockResolvedValue(false);

      const exists = await contains('non_existent_key');

      expect(mockModule.contains).toHaveBeenCalledWith('non_existent_key');
      expect(exists).toBe(false);
    });

    it('should check for required configuration keys', async () => {
      mockModule.contains.mockResolvedValue(true);

      const hasConfig = await contains('app_config');

      expect(mockModule.contains).toHaveBeenCalledWith('app_config');
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

      expect(mockModule.setMultiple).toHaveBeenCalledWith(profileData);
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

      expect(mockModule.setMultiple).toHaveBeenCalledWith(configData);
    });

    it('should handle empty batch gracefully', async () => {
      mockModule.setMultiple.mockResolvedValue(undefined);

      await setMultiple([]);

      expect(mockModule.setMultiple).toHaveBeenCalledWith([]);
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

      expect(mockModule.getMultiple).toHaveBeenCalledWith(keys);
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

      expect(mockModule.getMultiple).toHaveBeenCalledWith(keys);
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

      expect(mockModule.getMultiple).toHaveBeenCalledWith(keys);
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

      expect(mockModule.clearMultiple).toHaveBeenCalledWith(keysToClear);
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

      expect(mockModule.clearMultiple).toHaveBeenCalledWith(cacheKeys);
    });

    it('should handle empty keys array gracefully', async () => {
      mockModule.clearMultiple.mockResolvedValue(undefined);

      await clearMultiple([]);

      expect(mockModule.clearMultiple).toHaveBeenCalledWith([]);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user registration flow', async () => {
      // 1. Set user namespace
      mockModule.setName.mockResolvedValue(undefined);
      await setName('user_456');
      expect(mockModule.setName).toHaveBeenCalledWith('user_456');

      // 2. Store user profile
      const profileData = [
        { key: 'username', value: 'johndoe' },
        { key: 'email', value: 'john@example.com' },
        { key: 'created_at', value: new Date().toISOString() },
      ];
      mockModule.setMultiple.mockResolvedValue(undefined);
      await setMultiple(profileData);
      expect(mockModule.setMultiple).toHaveBeenCalledWith(profileData);

      // 3. Verify profile was stored
      const profileKeys = ['username', 'email', 'created_at'];
      const expectedProfile = {
        username: 'johndoe',
        email: 'john@example.com',
        created_at: expect.any(String),
      };
      mockModule.getMultiple.mockResolvedValue(expectedProfile);
      const storedProfile = await getMultiple(profileKeys);
      expect(mockModule.getMultiple).toHaveBeenCalledWith(profileKeys);
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
      expect(mockModule.setMultiple).toHaveBeenCalledWith(configData);

      // 2. Retrieve specific config
      mockModule.get.mockResolvedValue('v2');
      const apiVersion = await get('api_version');
      expect(mockModule.get).toHaveBeenCalledWith('api_version');
      expect(apiVersion).toBe('v2');

      // 3. Check if config exists
      mockModule.contains.mockResolvedValue(true);
      const hasConfig = await contains('debug_mode');
      expect(mockModule.contains).toHaveBeenCalledWith('debug_mode');
      expect(hasConfig).toBe(true);
    });

    it('should handle user preferences with namespace switching', async () => {
      // 1. Set default namespace preferences
      mockModule.set.mockResolvedValue(undefined);
      await set('default_theme', 'light');
      expect(mockModule.set).toHaveBeenCalledWith('default_theme', 'light');

      // 2. Switch to user namespace
      mockModule.setName.mockResolvedValue(undefined);
      await setName('user_789');
      expect(mockModule.setName).toHaveBeenCalledWith('user_789');

      // 3. Set user-specific preferences
      await set('theme', 'dark');
      expect(mockModule.set).toHaveBeenCalledWith('theme', 'dark');

      // 4. Switch back to default
      await setName('');
      expect(mockModule.setName).toHaveBeenCalledWith('');

      // 5. Verify default preferences still exist
      mockModule.get.mockResolvedValue('light');
      const defaultTheme = await get('default_theme');
      expect(mockModule.get).toHaveBeenCalledWith('default_theme');
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
      expect(mockModule.setMultiple).toHaveBeenCalledWith(testData);

      // 2. Clear specific temporary files
      const tempKeys = ['temp_file_1', 'temp_file_2'];
      mockModule.clearMultiple.mockResolvedValue(undefined);
      await clearMultiple(tempKeys);
      expect(mockModule.clearMultiple).toHaveBeenCalledWith(tempKeys);

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
        'large_data',
        'x'.repeat(1000000)
      );
    });

    it('should handle permission errors gracefully', async () => {
      const permissionError = new Error('Permission denied');
      mockModule.get.mockRejectedValue(permissionError);

      await expect(get('restricted_key')).rejects.toThrow('Permission denied');
      expect(mockModule.get).toHaveBeenCalledWith('restricted_key');
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      mockModule.setMultiple.mockRejectedValue(networkError);

      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        key: `key_${i}`,
        value: `value_${i}`,
      }));

      await expect(setMultiple(largeData)).rejects.toThrow('Network timeout');
      expect(mockModule.setMultiple).toHaveBeenCalledWith(largeData);
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
      expect(mockModule.setMultiple).toHaveBeenCalledWith(largeDataset);
    });

    it('should handle rapid namespace switching', async () => {
      const namespaces = Array.from({ length: 100 }, (_, i) => `ns_${i}`);
      mockModule.setName.mockResolvedValue(undefined);

      const startTime = performance.now();
      for (const ns of namespaces) {
        await setName(ns);
      }
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(mockModule.setName).toHaveBeenCalledTimes(100);
    });
  });
});
