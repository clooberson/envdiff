// pinner.js — pin current env values as expected baselines

/**
 * Create a pin map from an env object: { KEY: value, ... }
 * @param {Object} env
 * @returns {Object}
 */
function pinEnv(env) {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, { pinned: v }])
  );
}

/**
 * Compare a live env against a pin map.
 * Returns array of { key, pinned, actual, status }
 * status: 'match' | 'changed' | 'missing' | 'added'
 * @param {Object} pinMap
 * @param {Object} liveEnv
 * @returns {Array}
 */
function checkPins(pinMap, liveEnv) {
  const results = [];
  const pinnedKeys = new Set(Object.keys(pinMap));
  const liveKeys = new Set(Object.keys(liveEnv));

  for (const key of pinnedKeys) {
    if (!liveKeys.has(key)) {
      results.push({ key, pinned: pinMap[key].pinned, actual: undefined, status: 'missing' });
    } else if (liveEnv[key] === pinMap[key].pinned) {
      results.push({ key, pinned: pinMap[key].pinned, actual: liveEnv[key], status: 'match' });
    } else {
      results.push({ key, pinned: pinMap[key].pinned, actual: liveEnv[key], status: 'changed' });
    }
  }

  for (const key of liveKeys) {
    if (!pinnedKeys.has(key)) {
      results.push({ key, pinned: undefined, actual: liveEnv[key], status: 'added' });
    }
  }

  return results.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Returns true if all pinned keys match (ignores added keys).
 * @param {Array} pinResults
 * @returns {boolean}
 */
function isPinClean(pinResults) {
  return pinResults.every(r => r.status === 'match' || r.status === 'added');
}

/**
 * Build a summary object from pin results.
 * @param {Array} pinResults
 * @returns {Object}
 */
function buildPinSummary(pinResults) {
  const counts = { match: 0, changed: 0, missing: 0, added: 0 };
  for (const r of pinResults) counts[r.status]++;
  return { total: pinResults.length, ...counts, clean: isPinClean(pinResults) };
}

module.exports = { pinEnv, checkPins, isPinClean, buildPinSummary };
