const pkg = require('../package.json');
const { normalizeAppGroups, setAppGroupsEntitlement } = require('./appGroups');

// Resolve config-plugins through the app's `expo` package when available so we
// always use the version matching the user's SDK; fall back to a direct
// dependency for non-standard setups.
let configPlugins;
try {
  configPlugins = require('expo/config-plugins');
} catch {
  configPlugins = require('@expo/config-plugins');
}

const { withEntitlementsPlist, createRunOncePlugin } = configPlugins;

/**
 * Expo config plugin: adds the shared App Group to the iOS app target's
 * entitlements so JS (via `setName('group…')`) and native extensions
 * (widgets, watch apps, share extensions) read the same store.
 *
 * Android needs no configuration — SharedPreferences works out of the box.
 *
 * @param {object} config Expo config
 * @param {{ appGroup?: string | string[], appGroups?: string[] }} props
 */
const withTurboPreferences = (config, props) => {
  const appGroups = normalizeAppGroups(props);

  return withEntitlementsPlist(config, (modConfig) => {
    modConfig.modResults = setAppGroupsEntitlement(
      modConfig.modResults,
      appGroups
    );
    return modConfig;
  });
};

module.exports = createRunOncePlugin(
  withTurboPreferences,
  pkg.name,
  pkg.version
);
