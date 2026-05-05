/**
 * Compares two parsed env objects and returns a diff report.
 */

/**
 * @typedef {Object} DiffResult
 * @property {string[]} missingInB - Keys present in A but missing in B
 * @property {string[]} missingInA - Keys present in B but missing in A
 * @property {Array<{key: string, valueA: string, valueB: string}>} mismatched - Keys present in both but with different values
 * @property {string[]} matching - Keys present in both with identical values
 */

/**
 * Compare two parsed env maps.
 * @param {Record<string, string>} envA
 * @param {Record<string, string>} envB
 * @param {Object} [options]
 * @param {boolean} [options.ignoreValues=false] - Only check key presence, skip value comparison
 * @returns {DiffResult}
 */
function compareEnvs(envA, envB, options = {}) {
  const { ignoreValues = false } = options;

  const keysA = new Set(Object.keys(envA));
  const keysB = new Set(Object.keys(envB));

  const missingInB = [];
  const missingInA = [];
  const mismatched = [];
  const matching = [];

  for (const key of keysA) {
    if (!keysB.has(key)) {
      missingInB.push(key);
    } else if (!ignoreValues && envA[key] !== envB[key]) {
      mismatched.push({ key, valueA: envA[key], valueB: envB[key] });
    } else {
      matching.push(key);
    }
  }

  for (const key of keysB) {
    if (!keysA.has(key)) {
      missingInA.push(key);
    }
  }

  return {
    missingInB: missingInB.sort(),
    missingInA: missingInA.sort(),
    mismatched: mismatched.sort((a, b) => a.key.localeCompare(b.key)),
    matching: matching.sort(),
  };
}

/**
 * Returns true if the diff result has no issues.
 * @param {DiffResult} diff
 * @returns {boolean}
 */
function isClean(diff) {
  return (
    diff.missingInB.length === 0 &&
    diff.missingInA.length === 0 &&
    diff.mismatched.length === 0
  );
}

module.exports = { compareEnvs, isClean };
