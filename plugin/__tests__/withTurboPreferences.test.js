const withTurboPreferences = require('../../app.plugin.js');
const { ENTITLEMENT_KEY } = require('../appGroups');

/** Applies the plugin to a minimal Expo config and runs the entitlements mod. */
async function applyPlugin(props, existingEntitlements = {}) {
  const config = withTurboPreferences(
    { name: 'test-app', slug: 'test-app' },
    props
  );

  const entitlementsMod = config.mods && config.mods.ios.entitlements;
  expect(typeof entitlementsMod).toBe('function');

  const result = await entitlementsMod({
    ...config,
    modResults: existingEntitlements,
    modRequest: {},
  });
  return result.modResults;
}

describe('withTurboPreferences (app.plugin.js)', () => {
  it('exports a config plugin function', () => {
    expect(typeof withTurboPreferences).toBe('function');
  });

  it('throws a helpful error when appGroup is missing', () => {
    expect(() =>
      withTurboPreferences({ name: 'test-app', slug: 'test-app' }, {})
    ).toThrow(/Missing `appGroup`/);
  });

  it('adds the App Group to the iOS entitlements', async () => {
    const entitlements = await applyPlugin({
      appGroup: 'group.com.test.app',
    });
    expect(entitlements[ENTITLEMENT_KEY]).toEqual(['group.com.test.app']);
  });

  it('merges with pre-existing entitlements without duplicating', async () => {
    const entitlements = await applyPlugin(
      { appGroup: ['group.com.test.app', 'group.com.other'] },
      {
        'aps-environment': 'production',
        [ENTITLEMENT_KEY]: ['group.com.test.app'],
      }
    );
    expect(entitlements['aps-environment']).toBe('production');
    expect(entitlements[ENTITLEMENT_KEY]).toEqual([
      'group.com.test.app',
      'group.com.other',
    ]);
  });
});
