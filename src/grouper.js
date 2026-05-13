/**
 * grouper.js — Group env keys by prefix, namespace, or custom pattern
 */

/**
 * Extract prefix from a key using a separator (default '_')
 * @param {string} key
 * @param {string} sep
 * @returns {string}
 */
function extractPrefix(key, sep = '_') {
  const idx = key.indexOf(sep);
  return idx > 0 ? key.slice(0, idx) : '__ungrouped__';
}

/**
 * Group an env object by key prefix
 * @param {Object} env - { KEY: value }
 * @param {string} sep
 * @returns {Object} - { PREFIX: { KEY: value } }
 */
function groupByPrefix(env, sep = '_') {
  const groups = {};
  for (const [key, value] of Object.entries(env)) {
    const prefix = extractPrefix(key, sep);
    if (!groups[prefix]) groups[prefix] = {};
    groups[prefix][key] = value;
  }
  return groups;
}

/**
 * Group multiple envs by prefix, merging keys across envs
 * @param {Object[]} envs - array of env objects
 * @param {string} sep
 * @returns {Object} - { PREFIX: Set<string> }
 */
function groupKeysAcrossEnvs(envs, sep = '_') {
  const groups = {};
  for (const env of envs) {
    for (const key of Object.keys(env)) {
      const prefix = extractPrefix(key, sep);
      if (!groups[prefix]) groups[prefix] = new Set();
      groups[prefix].add(key);
    }
  }
  // Convert sets to sorted arrays
  return Object.fromEntries(
    Object.entries(groups).map(([p, s]) => [p, [...s].sort()])
  );
}

/**
 * Build a summary of groups: count of keys per prefix
 * @param {Object} grouped - result of groupByPrefix or groupKeysAcrossEnvs
 * @returns {Object} - { PREFIX: count }
 */
function buildGroupSummary(grouped) {
  return Object.fromEntries(
    Object.entries(grouped).map(([prefix, val]) => [
      prefix,
      Array.isArray(val) ? val.length : Object.keys(val).length
    ])
  );
}

module.exports = { extractPrefix, groupByPrefix, groupKeysAcrossEnvs, buildGroupSummary };
