/**
 * Validates .env values against optional type/format rules.
 */

const RULES = {
  nonempty: (val) => val !== '',
  number: (val) => !isNaN(Number(val)) && val.trim() !== '',
  boolean: (val) => ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase()),
  url: (val) => {
    try { new URL(val); return true; } catch { return false; }
  },
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  alphanumeric: (val) => /^[a-zA-Z0-9_-]+$/.test(val),
};

/**
 * Validate a single key/value pair against a rule name.
 * @param {string} key
 * @param {string} value
 * @param {string} ruleName
 * @returns {{ key, rule, valid, value }}
 */
function validateField(key, value, ruleName) {
  const fn = RULES[ruleName];
  if (!fn) throw new Error(`Unknown validation rule: "${ruleName}"`);
  return { key, rule: ruleName, valid: fn(value), value };
}

/**
 * Validate all keys in an env map against a schema object.
 * Schema: { KEY: 'ruleName' | ['rule1', 'rule2'] }
 * @param {Object} envMap
 * @param {Object} schema
 * @returns {Array<{ key, rule, valid, value }>}
 */
function validateEnv(envMap, schema) {
  const results = [];
  for (const [key, rules] of Object.entries(schema)) {
    const value = envMap[key] ?? '';
    const ruleList = Array.isArray(rules) ? rules : [rules];
    for (const rule of ruleList) {
      results.push(validateField(key, value, rule));
    }
  }
  return results;
}

/**
 * Returns only failed validations.
 * @param {Array} results
 * @returns {Array}
 */
function getFailures(results) {
  return results.filter((r) => !r.valid);
}

/**
 * Returns true if all validations passed.
 * @param {Array} results
 * @returns {boolean}
 */
function isValid(results) {
  return results.every((r) => r.valid);
}

module.exports = { validateField, validateEnv, getFailures, isValid, RULES };
