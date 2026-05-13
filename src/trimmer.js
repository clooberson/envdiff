/**
 * trimmer.js — Strip trailing whitespace, normalize quotes, and clean up .env values
 */

/**
 * Trim whitespace from a single value.
 * @param {string} value
 * @returns {string}
 */
function trimValue(value) {
  if (typeof value !== 'string') return value;
  return value.trim();
}

/**
 * Normalize quotes: remove surrounding single or double quotes from a value.
 * @param {string} value
 * @returns {string}
 */
function normalizeQuotes(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Trim all values in an env object.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function trimEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = trimValue(value);
  }
  return result;
}

/**
 * Normalize quotes for all values in an env object.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function normalizeEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = normalizeQuotes(value);
  }
  return result;
}

/**
 * Build a summary of which keys were changed by trimming/normalizing.
 * @param {Record<string, string>} original
 * @param {Record<string, string>} cleaned
 * @returns {{ changed: string[], unchanged: string[] }}
 */
function buildTrimSummary(original, cleaned) {
  const changed = [];
  const unchanged = [];
  for (const key of Object.keys(original)) {
    if (original[key] !== cleaned[key]) {
      changed.push(key);
    } else {
      unchanged.push(key);
    }
  }
  return { changed, unchanged };
}

module.exports = { trimValue, normalizeQuotes, trimEnv, normalizeEnv, buildTrimSummary };
