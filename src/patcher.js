/**
 * patcher.js — Apply diffs to produce a patched env output
 */

/**
 * Apply a diff result to a base env, producing a patched env object.
 * Missing keys are added, mismatched values are overwritten.
 *
 * @param {Object} base - base env key/value pairs
 * @param {Object} diff - diff result from compareEnvs
 * @param {Object} source - source env to pull values from
 * @returns {Object} patched env
 */
function applyPatch(base, diff, source) {
  const patched = { ...base };

  for (const key of diff.missingInBase || []) {
    if (key in source) {
      patched[key] = source[key];
    }
  }

  for (const key of diff.mismatched || []) {
    if (key in source) {
      patched[key] = source[key];
    }
  }

  return patched;
}

/**
 * Serialize a patched env object back to .env file string format.
 *
 * @param {Object} env - key/value pairs
 * @returns {string}
 */
function serializeEnv(env) {
  return Object.entries(env)
    .map(([key, value]) => {
      const needsQuotes = /\s|#/.test(value);
      const serialized = needsQuotes ? `"${value}"` : value;
      return `${key}=${serialized}`;
    })
    .join('\n') + '\n';
}

/**
 * Generate a patch summary describing what changed.
 *
 * @param {Object} diff
 * @returns {Object}
 */
function patchSummary(diff) {
  return {
    added: (diff.missingInBase || []).length,
    updated: (diff.mismatched || []).length,
    total: (diff.missingInBase || []).length + (diff.mismatched || []).length,
  };
}

module.exports = { applyPatch, serializeEnv, patchSummary };
