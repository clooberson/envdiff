// masker.js — Mask env values for safe display (partial reveal, length hint)

const DEFAULT_MASK = '****';
const REVEAL_CHARS = 3;

/**
 * Mask a single value, optionally revealing the first N characters.
 * @param {string} value
 * @param {object} opts
 * @returns {string}
 */
function maskValue(value, opts = {}) {
  if (typeof value !== 'string' || value.length === 0) return value;
  const reveal = opts.reveal ?? REVEAL_CHARS;
  const hint = opts.hint ?? true;
  if (value.length <= reveal) return DEFAULT_MASK;
  const prefix = value.slice(0, reveal);
  const suffix = hint ? `…(${value.length})` : DEFAULT_MASK;
  return `${prefix}${suffix}`;
}

/**
 * Mask all values in an env object.
 * Keys matching the sensitive pattern are always fully masked.
 * @param {Record<string, string>} env
 * @param {object} opts
 * @returns {Record<string, string>}
 */
function maskEnv(env, opts = {}) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = maskValue(value, opts);
  }
  return result;
}

/**
 * Selectively mask only the keys listed in `keys`.
 * All other keys are passed through unchanged.
 * @param {Record<string, string>} env
 * @param {string[]} keys
 * @param {object} opts
 * @returns {Record<string, string>}
 */
function maskKeys(env, keys, opts = {}) {
  const set = new Set(keys.map(k => k.toUpperCase()));
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = set.has(key.toUpperCase()) ? maskValue(value, opts) : value;
  }
  return result;
}

/**
 * Apply masking to a diff result's values.
 * Works on the flat array format from differ.js (flattenGrouped).
 * @param {Array<{key: string, a: string, b: string, status: string}>} rows
 * @param {object} opts
 * @returns {Array}
 */
function maskDiffRows(rows, opts = {}) {
  return rows.map(row => ({
    ...row,
    a: row.a != null ? maskValue(row.a, opts) : row.a,
    b: row.b != null ? maskValue(row.b, opts) : row.b,
  }));
}

module.exports = { maskValue, maskEnv, maskKeys, maskDiffRows };
