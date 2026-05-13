/**
 * normalizer.js
 * Normalize .env key/value pairs for consistent comparison:
 * - uppercase keys
 * - trim whitespace from values
 * - normalize boolean-like values
 * - normalize numeric strings
 */

'use strict';

const BOOL_TRUE = new Set(['true', 'yes', '1', 'on']);
const BOOL_FALSE = new Set(['false', 'no', '0', 'off']);

/**
 * Normalize a single key to uppercase with trimmed whitespace.
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  if (typeof key !== 'string') return key;
  return key.trim().toUpperCase();
}

/**
 * Normalize a single value:
 * - trim surrounding whitespace
 * - normalize boolean-like strings to 'true'/'false'
 * - normalize numeric strings by removing leading zeros (non-decimal excluded)
 * @param {string} value
 * @returns {string}
 */
function normalizeValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  if (BOOL_TRUE.has(lower)) return 'true';
  if (BOOL_FALSE.has(lower)) return 'false';

  // Normalize numeric strings (integer only, skip hex/octal)
  if (/^-?\d+$/.test(trimmed)) {
    return String(parseInt(trimmed, 10));
  }

  return trimmed;
}

/**
 * Normalize an entire env object: uppercase keys, normalized values.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function normalizeEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[normalizeKey(key)] = normalizeValue(value);
  }
  return result;
}

/**
 * Normalize multiple envs (array or object map).
 * @param {Record<string, Record<string, string>>} envMap
 * @returns {Record<string, Record<string, string>>}
 */
function normalizeAll(envMap) {
  const result = {};
  for (const [name, env] of Object.entries(envMap)) {
    result[name] = normalizeEnv(env);
  }
  return result;
}

/**
 * Build a summary of changes made during normalization.
 * @param {Record<string, string>} original
 * @param {Record<string, string>} normalized
 * @returns {{ keyChanges: string[], valueChanges: string[] }}
 */
function buildNormalizeSummary(original, normalized) {
  const keyChanges = [];
  const valueChanges = [];

  for (const [origKey, origVal] of Object.entries(original)) {
    const normKey = normalizeKey(origKey);
    const normVal = normalizeValue(origVal);

    if (normKey !== origKey) keyChanges.push(`${origKey} → ${normKey}`);
    if (normVal !== origVal.trim()) valueChanges.push(`${normKey}: "${origVal}" → "${normVal}"`);
  }

  return { keyChanges, valueChanges };
}

module.exports = { normalizeKey, normalizeValue, normalizeEnv, normalizeAll, buildNormalizeSummary };
