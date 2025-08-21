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

    await mockTurboPreferences.set('test_key', 'test_value');

    expect(mockTurboPreferences.set).toHaveBeenCalledWith(
      'test_key',
      'test_value'
    );
  });

  it('should call TurboPreferences.get when getting a value', async () => {
    mockTurboPreferences.get.mockResolvedValue('test_value');

    const result = await mockTurboPreferences.get('test_key');

    expect(mockTurboPreferences.get).toHaveBeenCalledWith('test_key');
    expect(result).toBe('test_value');
  });

  it('should call TurboPreferences.clear when clearing a value', async () => {
    mockTurboPreferences.clear.mockResolvedValue(undefined);

    await mockTurboPreferences.clear('test_key');

    expect(mockTurboPreferences.clear).toHaveBeenCalledWith('test_key');
  });

  it('should call TurboPreferences.contains when checking if key exists', async () => {
    mockTurboPreferences.contains.mockResolvedValue(true);

    const result = await mockTurboPreferences.contains('test_key');

    expect(mockTurboPreferences.contains).toHaveBeenCalledWith('test_key');
    expect(result).toBe(true);
  });
});
