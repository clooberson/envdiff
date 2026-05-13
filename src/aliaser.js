/**
 * aliaser.js — map legacy or alternate key names to canonical keys
 */

/**
 * Build a reverse lookup: alias -> canonical
 * @param {Record<string, string[]>} aliasMap  canonical -> [aliases]
 * @returns {Record<string, string>}
 */
function buildReverseMap(aliasMap) {
  const reverse = {};
  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    for (const alias of aliases) {
      reverse[alias] = canonical;
    }
  }
  return reverse;
}

/**
 * Resolve an env object so that alias keys are renamed to their canonical form.
 * If both the alias and canonical key exist, canonical wins.
 * @param {Record<string, string>} env
 * @param {Record<string, string[]>} aliasMap
 * @returns {Record<string, string>}
 */
function resolveAliases(env, aliasMap) {
  const reverse = buildReverseMap(aliasMap);
  const result = {};

  for (const [key, value] of Object.entries(env)) {
    const canonical = reverse[key] || key;
    // canonical key already present takes priority
    if (!(canonical in result)) {
      result[canonical] = value;
    }
  }

  return result;
}

/**
 * Find keys in env that are known aliases (not yet canonical).
 * @param {Record<string, string>} env
 * @param {Record<string, string[]>} aliasMap
 * @returns {Array<{alias: string, canonical: string}>}
 */
function findAliasedKeys(env, aliasMap) {
  const reverse = buildReverseMap(aliasMap);
  return Object.keys(env)
    .filter((k) => k in reverse)
    .map((k) => ({ alias: k, canonical: reverse[k] }));
}

/**
 * Summarise alias resolution for reporting.
 * @param {Record<string, string>} env
 * @param {Record<string, string[]>} aliasMap
 * @returns {{ resolved: number, conflicts: number, details: Array }}
 */
function buildAliasSummary(env, aliasMap) {
  const reverse = buildReverseMap(aliasMap);
  const details = [];
  let conflicts = 0;

  for (const [key] of Object.entries(env)) {
    if (key in reverse) {
      const canonical = reverse[key];
      const hasConflict = canonical in env;
      details.push({ alias: key, canonical, conflict: hasConflict });
      if (hasConflict) conflicts++;
    }
  }

  return { resolved: details.length, conflicts, details };
}

module.exports = { buildReverseMap, resolveAliases, findAliasedKeys, buildAliasSummary };
