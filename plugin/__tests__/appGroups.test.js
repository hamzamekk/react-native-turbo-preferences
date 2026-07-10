const {
  ENTITLEMENT_KEY,
  normalizeAppGroups,
  setAppGroupsEntitlement,
} = require('../appGroups');

describe('normalizeAppGroups', () => {
  it('accepts a single appGroup string', () => {
    expect(normalizeAppGroups({ appGroup: 'group.com.test.app' })).toEqual([
      'group.com.test.app',
    ]);
  });

  it('accepts an array of appGroup strings', () => {
    expect(
      normalizeAppGroups({ appGroup: ['group.com.a', 'group.com.b'] })
    ).toEqual(['group.com.a', 'group.com.b']);
  });

  it('accepts the appGroups alias', () => {
    expect(normalizeAppGroups({ appGroups: ['group.com.a'] })).toEqual([
      'group.com.a',
    ]);
  });

  it('throws when no appGroup is provided', () => {
    expect(() => normalizeAppGroups(undefined)).toThrow(/Missing `appGroup`/);
    expect(() => normalizeAppGroups({})).toThrow(/Missing `appGroup`/);
  });

  it('throws on an empty array', () => {
    expect(() => normalizeAppGroups({ appGroup: [] })).toThrow(/empty array/);
  });

  it('throws on non-string or empty entries', () => {
    expect(() => normalizeAppGroups({ appGroup: 42 })).toThrow(
      /Invalid App Group/
    );
    expect(() => normalizeAppGroups({ appGroup: [''] })).toThrow(
      /Invalid App Group/
    );
  });

  it('warns when the identifier is missing the "group." prefix', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    normalizeAppGroups({ appGroup: 'com.test.app' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('does not start with "group."')
    );
    warn.mockRestore();
  });
});

describe('setAppGroupsEntitlement', () => {
  it('adds the entitlement to empty entitlements', () => {
    expect(setAppGroupsEntitlement({}, ['group.com.test.app'])).toEqual({
      [ENTITLEMENT_KEY]: ['group.com.test.app'],
    });
  });

  it('preserves existing groups and other entitlements', () => {
    const entitlements = {
      'aps-environment': 'production',
      [ENTITLEMENT_KEY]: ['group.com.existing'],
    };
    expect(setAppGroupsEntitlement(entitlements, ['group.com.new'])).toEqual({
      'aps-environment': 'production',
      [ENTITLEMENT_KEY]: ['group.com.existing', 'group.com.new'],
    });
  });

  it('does not duplicate groups that are already present', () => {
    const entitlements = { [ENTITLEMENT_KEY]: ['group.com.test.app'] };
    expect(
      setAppGroupsEntitlement(entitlements, ['group.com.test.app'])
    ).toEqual({ [ENTITLEMENT_KEY]: ['group.com.test.app'] });
  });

  it('does not mutate the input entitlements', () => {
    const entitlements = { [ENTITLEMENT_KEY]: ['group.com.existing'] };
    setAppGroupsEntitlement(entitlements, ['group.com.new']);
    expect(entitlements[ENTITLEMENT_KEY]).toEqual(['group.com.existing']);
  });

  it('replaces a malformed (non-array) existing value', () => {
    const entitlements = { [ENTITLEMENT_KEY]: 'not-an-array' };
    expect(setAppGroupsEntitlement(entitlements, ['group.com.a'])).toEqual({
      [ENTITLEMENT_KEY]: ['group.com.a'],
    });
  });
});
