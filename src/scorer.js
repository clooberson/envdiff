/**
 * scorer.js — Compute a similarity/health score between two env files
 */

/**
 * Percentage of keys shared between two env maps.
 * @param {Object} a
 * @param {Object} b
 * @returns {number} 0–100
 */
function sharedKeyScore(a, b) {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));
  const union = new Set([...keysA, ...keysB]);
  if (union.size === 0) return 100;
  const intersection = [...keysA].filter(k => keysB.has(k)).length;
  return Math.round((intersection / union.size) * 100);
}

/**
 * Percentage of shared keys whose values are identical.
 * @param {Object} a
 * @param {Object} b
 * @returns {number} 0–100
 */
function valueMatchScore(a, b) {
  const shared = Object.keys(a).filter(k => k in b);
  if (shared.length === 0) return 100;
  const matching = shared.filter(k => a[k] === b[k]).length;
  return Math.round((matching / shared.length) * 100);
}

/**
 * Count keys missing from b that exist in a.
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function missingCount(a, b) {
  return Object.keys(a).filter(k => !(k in b)).length;
}

/**
 * Build a full score report between two env maps.
 * @param {Object} a
 * @param {Object} b
 * @param {string} [labelA='A']
 * @param {string} [labelB='B']
 * @returns {Object}
 */
function buildScore(a, b, labelA = 'A', labelB = 'B') {
  const keyScore = sharedKeyScore(a, b);
  const valScore = valueMatchScore(a, b);
  // Weighted overall: 60% key coverage, 40% value match
  const overall = Math.round(keyScore * 0.6 + valScore * 0.4);

  return {
    overall,
    keyScore,
    valueMatchScore: valScore,
    missingInB: missingCount(a, b),
    missingInA: missingCount(b, a),
    totalKeys: new Set([...Object.keys(a), ...Object.keys(b)]).size,
    labels: { a: labelA, b: labelB },
  };
}

module.exports = { sharedKeyScore, valueMatchScore, missingCount, buildScore };
