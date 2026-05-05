/**
 * merger.js — Merge multiple .env files with conflict detection
 */

/**
 * Merge two env objects, returning merged result and conflicts.
 * Later values win unless strict mode is enabled.
 * @param {Object} base
 * @param {Object} override
 * @param {Object} options
 * @returns {{ merged: Object, conflicts: Array }}
 */
function mergeEnvs(base, override, options = {}) {
  const { strict = false } = options;
  const merged = { ...base };
  const conflicts = [];

  for (const [key, value] of Object.entries(override)) {
    if (key in merged && merged[key] !== value) {
      conflicts.push({
        key,
        baseValue: merged[key],
        overrideValue: value,
      });
      if (!strict) {
        merged[key] = value;
      }
    } else {
      merged[key] = value;
    }
  }

  return { merged, conflicts };
}

/**
 * Merge an array of env objects in order.
 * @param {Object[]} envList
 * @param {Object} options
 * @returns {{ merged: Object, conflicts: Array }}
 */
function mergeAll(envList, options = {}) {
  if (!Array.isArray(envList) || envList.length === 0) {
    return { merged: {}, conflicts: [] };
  }

  let accumulated = {};
  const allConflicts = [];

  for (const env of envList) {
    const { merged, conflicts } = mergeEnvs(accumulated, env, options);
    accumulated = merged;
    allConflicts.push(...conflicts);
  }

  return { merged: accumulated, conflicts: allConflicts };
}

/**
 * Check whether a merge result has any conflicts.
 * @param {Array} conflicts
 * @returns {boolean}
 */
function hasConflicts(conflicts) {
  return Array.isArray(conflicts) && conflicts.length > 0;
}

module.exports = { mergeEnvs, mergeAll, hasConflicts };
