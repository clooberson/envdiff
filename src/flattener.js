/**
 * flattener.js — flatten nested object structures into dot-notation env keys
 * e.g. { db: { host: 'localhost' } } => { DB_HOST: 'localhost' }
 */

/**
 * Recursively flatten a nested object into dot-notation keys.
 * @param {object} obj
 * @param {string} prefix
 * @returns {object}
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = Array.isArray(value) ? value.join(',') : String(value ?? '');
    }
  }
  return result;
}

/**
 * Convert dot-notation keys to SCREAMING_SNAKE_CASE env keys.
 * @param {object} flat
 * @returns {object}
 */
function toEnvKeys(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const envKey = key.replace(/\./g, '_').replace(/-/g, '_').toUpperCase();
    result[envKey] = value;
  }
  return result;
}

/**
 * Full pipeline: flatten nested object and convert keys to env format.
 * @param {object} obj
 * @returns {object}
 */
function flattenToEnv(obj) {
  const flat = flattenObject(obj);
  return toEnvKeys(flat);
}

/**
 * Build a summary of how many keys were produced.
 * @param {object} original
 * @param {object} flattened
 * @returns {object}
 */
function buildFlattenSummary(original, flattened) {
  const originalCount = Object.keys(original).length;
  const flatCount = Object.keys(flattened).length;
  return {
    originalKeys: originalCount,
    flattenedKeys: flatCount,
    expanded: flatCount - originalCount,
  };
}

module.exports = { flattenObject, toEnvKeys, flattenToEnv, buildFlattenSummary };
