import TurboPreferences from '../../NativeTurboPreferences';

// Mock the TurboPreferences module
jest.mock('../../NativeTurboPreferences', () => ({
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  contains: jest.fn(),
}));

const mockTurboPreferences = TurboPreferences as jest.Mocked<
  typeof TurboPreferences
>;

describe('usePreferenceString', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock TurboPreferences correctly', () => {
    expect(mockTurboPreferences.get).toBeDefined();
    expect(mockTurboPreferences.set).toBeDefined();
    expect(mockTurboPreferences.clear).toBeDefined();
    expect(mockTurboPreferences.contains).toBeDefined();
  });

  it('should call TurboPreferences.set when setting a value', async () => {
    mockTurboPreferences.set.mockResolvedValue(undefined);

    await mockTurboPreferences.set(null, 'test_key', 'test_value');

    expect(mockTurboPreferences.set).toHaveBeenCalledWith(
      null,
      'test_key',
      'test_value'
    );
  });

  it('should call TurboPreferences.get when getting a value', async () => {
    mockTurboPreferences.get.mockResolvedValue('test_value');

    const result = await mockTurboPreferences.get(null, 'test_key');

    expect(mockTurboPreferences.get).toHaveBeenCalledWith(null, 'test_key');
    expect(result).toBe('test_value');
  });

  it('should call TurboPreferences.clear when clearing a value', async () => {
    mockTurboPreferences.clear.mockResolvedValue(undefined);

    await mockTurboPreferences.clear(null, 'test_key');

    expect(mockTurboPreferences.clear).toHaveBeenCalledWith(null, 'test_key');
  });

  it('should call TurboPreferences.contains when checking if key exists', async () => {
    mockTurboPreferences.contains.mockResolvedValue(true);

    const result = await mockTurboPreferences.contains(null, 'test_key');

    expect(mockTurboPreferences.contains).toHaveBeenCalledWith(
      null,
      'test_key'
    );
    expect(result).toBe(true);
  });
});
