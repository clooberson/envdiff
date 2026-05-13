// typecheck.js — validate env values against expected types

const TYPE_PATTERNS = {
  int: /^-?\d+$/,
  float: /^-?\d+(\.\d+)?$/,
  bool: /^(true|false|1|0|yes|no)$/i,
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  port: /^\d{1,5}$/,
};

const PORT_MAX = 65535;

/**
 * Check a single value against a type string.
 * Returns null if valid, or an error string if invalid.
 */
function checkType(key, value, type) {
  if (value === undefined || value === '') return null; // skip missing/empty
  const pattern = TYPE_PATTERNS[type];
  if (!pattern) return `unknown type "${type}" for key ${key}`;
  if (!pattern.test(value)) return `${key}=${JSON.stringify(value)} is not a valid ${type}`;
  if (type === 'port') {
    const n = parseInt(value, 10);
    if (n < 1 || n > PORT_MAX) return `${key}=${value} port out of range (1-${PORT_MAX})`;
  }
  return null;
}

/**
 * Run type checks across an env object given a schema map { KEY: 'type' }.
 * Returns array of { key, value, type, error } failure objects.
 */
function typecheckEnv(env, schema) {
  const failures = [];
  for (const [key, type] of Object.entries(schema)) {
    const value = env[key];
    const error = checkType(key, value, type);
    if (error) failures.push({ key, value, type, error });
  }
  return failures;
}

/**
 * Returns true when all schema keys pass type validation.
 */
function isTypesValid(env, schema) {
  return typecheckEnv(env, schema).length === 0;
}

/**
 * Format failures into a human-readable string.
 */
function formatTypeFailures(failures) {
  if (failures.length === 0) return 'All type checks passed.';
  const lines = failures.map(f => `  [${f.type}] ${f.error}`);
  return `Type check failures (${failures.length}):\n${lines.join('\n')}`;
}

module.exports = { checkType, typecheckEnv, isTypesValid, formatTypeFailures };
