const ENTITLEMENT_KEY = 'com.apple.security.application-groups';

/**
 * Normalizes plugin props into a list of App Group identifiers.
 * Accepts `appGroup: string | string[]` (or the `appGroups` alias).
 */
function normalizeAppGroups(props) {
  const raw = (props && (props.appGroup ?? props.appGroups)) ?? null;

  if (raw == null) {
    throw new Error(
      '[react-native-turbo-preferences] Missing `appGroup` option. ' +
        'Pass the App Group your app and extensions share, e.g.\n' +
        '  ["react-native-turbo-preferences", { "appGroup": "group.com.yourcompany.yourapp" }]'
    );
  }

  const groups = Array.isArray(raw) ? raw : [raw];

  if (groups.length === 0) {
    throw new Error(
      '[react-native-turbo-preferences] `appGroup` is an empty array — pass at least one App Group identifier.'
    );
  }

  for (const group of groups) {
    if (typeof group !== 'string' || group.length === 0) {
      throw new Error(
        `[react-native-turbo-preferences] Invalid App Group: ${JSON.stringify(
          group
        )}. Expected a non-empty string like "group.com.yourcompany.yourapp".`
      );
    }
    if (!group.startsWith('group.')) {
      console.warn(
        `[react-native-turbo-preferences] App Group "${group}" does not start with "group." — ` +
          'iOS requires App Group identifiers to use the "group." prefix.'
      );
    }
  }

  return groups;
}

/**
 * Returns a new entitlements object with the App Groups merged into
 * `com.apple.security.application-groups`, preserving existing entries.
 */
function setAppGroupsEntitlement(entitlements, appGroups) {
  const existing = Array.isArray(entitlements[ENTITLEMENT_KEY])
    ? entitlements[ENTITLEMENT_KEY]
    : [];

  const merged = [...existing];
  for (const group of appGroups) {
    if (!merged.includes(group)) {
      merged.push(group);
    }
  }

  return { ...entitlements, [ENTITLEMENT_KEY]: merged };
}

module.exports = {
  ENTITLEMENT_KEY,
  normalizeAppGroups,
  setAppGroupsEntitlement,
};
