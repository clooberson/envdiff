// linter.js — checks .env files for style and correctness issues

const VALID_KEY_RE = /^[A-Z_][A-Z0-9_]*$/;
const QUOTED_VALUE_RE = /^".*"$|^'.*'$/;

/**
 * Check a single key for naming convention issues.
 * @param {string} key
 * @returns {string|null} issue message or null
 */
function lintKey(key) {
  if (!key) return 'empty key';
  if (!VALID_KEY_RE.test(key)) return `key "${key}" should be UPPER_SNAKE_CASE`;
  return null;
}

/**
 * Check a single value for common issues.
 * @param {string} key
 * @param {string} value
 * @returns {string|null} issue message or null
 */
function lintValue(key, value) {
  if (value === undefined || value === null) return `key "${key}" has no value`;
  if (value.trim() !== value) return `key "${key}" value has leading/trailing whitespace`;
  if (value.includes('#') && !QUOTED_VALUE_RE.test(value)) {
    return `key "${key}" value contains '#' but is not quoted`;
  }
  return null;
}

/**
 * Lint all entries in a parsed env object.
 * @param {Record<string, string>} env
 * @returns {Array<{key: string, issue: string}>}
 */
function lintEnv(env) {
  const issues = [];
  for (const [key, value] of Object.entries(env)) {
    const keyIssue = lintKey(key);
    if (keyIssue) issues.push({ key, issue: keyIssue });

    const valIssue = lintValue(key, value);
    if (valIssue) issues.push({ key, issue: valIssue });
  }
  return issues;
}

/**
 * Returns true if there are no lint issues.
 * @param {Array<{key: string, issue: string}>} issues
 * @returns {boolean}
 */
function isCleanLint(issues) {
  return issues.length === 0;
}

module.exports = { lintKey, lintValue, lintEnv, isCleanLint };
