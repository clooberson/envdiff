/**
 * filter.js — utilities for filtering keys in env diff results
 */

/**
 * Filter diff results to only include keys matching a pattern or list.
 * @param {object} diffResult - output from compareEnvs
 * @param {string[]|RegExp} include - keys to include
 * @returns {object}
 */
function filterByKeys(diffResult, include) {
  if (!include || (Array.isArray(include) && include.length === 0)) {
    return diffResult;
  }

  const matcher = buildMatcher(include);

  return {
    missing: diffResult.missing.filter(matcher),
    extra: diffResult.extra.filter(matcher),
    mismatched: diffResult.mismatched.filter((entry) => matcher(entry.key)),
  };
}

/**
 * Filter diff results to exclude keys matching a pattern or list.
 * @param {object} diffResult - output from compareEnvs
 * @param {string[]|RegExp} exclude - keys to exclude
 * @returns {object}
 */
function filterExcludeKeys(diffResult, exclude) {
  if (!exclude || (Array.isArray(exclude) && exclude.length === 0)) {
    return diffResult;
  }

  const matcher = buildMatcher(exclude);

  return {
    missing: diffResult.missing.filter((k) => !matcher(k)),
    extra: diffResult.extra.filter((k) => !matcher(k)),
    mismatched: diffResult.mismatched.filter((entry) => !matcher(entry.key)),
  };
}

/**
 * Build a matcher function from a string array or RegExp.
 * @param {string[]|RegExp} pattern
 * @returns {function(string): boolean}
 */
function buildMatcher(pattern) {
  if (pattern instanceof RegExp) {
    return (key) => pattern.test(key);
  }
  if (Array.isArray(pattern)) {
    const set = new Set(pattern);
    return (key) => set.has(key);
  }
  throw new TypeError('include/exclude must be a string array or RegExp');
}

module.exports = { filterByKeys, filterExcludeKeys, buildMatcher };
