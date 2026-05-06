/**
 * redactor.js — Mask sensitive values in env diff output
 */

const DEFAULT_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

const MASK = '***';

/**
 * Returns true if the key matches any sensitive pattern.
 * @param {string} key
 * @param {RegExp[]} patterns
 * @returns {boolean}
 */
function isSensitiveKey(key, patterns = DEFAULT_PATTERNS) {
  return patterns.some((re) => re.test(key));
}

/**
 * Redacts values for sensitive keys in a parsed env object.
 * @param {Record<string, string>} env
 * @param {RegExp[]} [patterns]
 * @returns {Record<string, string>}
 */
function redactEnv(env, patterns = DEFAULT_PATTERNS) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = isSensitiveKey(key, patterns) ? MASK : value;
  }
  return result;
}

/**
 * Redacts values inside a diff result array produced by compareEnvs.
 * Each entry has { key, status, values: { [file]: string } }.
 * @param {Array} diffEntries
 * @param {RegExp[]} [patterns]
 * @returns {Array}
 */
function redactDiff(diffEntries, patterns = DEFAULT_PATTERNS) {
  return diffEntries.map((entry) => {
    if (!isSensitiveKey(entry.key, patterns)) return entry;
    const redactedValues = {};
    for (const file of Object.keys(entry.values || {})) {
      redactedValues[file] = entry.values[file] !== undefined ? MASK : undefined;
    }
    return { ...entry, values: redactedValues, redacted: true };
  });
}

module.exports = { isSensitiveKey, redactEnv, redactDiff, DEFAULT_PATTERNS, MASK };
