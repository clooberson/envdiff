/**
 * stringer.js — serialize/deserialize env objects to/from .env string format
 */

/**
 * Serialize an env object back to a .env-format string.
 * Keys with null/undefined values are written as empty.
 */
function stringifyEnv(env, options = {}) {
  const { sortKeys = false, addNewline = true } = options;
  let keys = Object.keys(env);
  if (sortKeys) keys = keys.slice().sort();

  const lines = keys.map((key) => {
    const val = env[key];
    if (val === null || val === undefined) return `${key}=`;
    const needsQuotes = /[\s#"'\\]/.test(val) || val === '';
    if (needsQuotes) {
      const escaped = val.replace(/"/g, '\\"');
      return `${key}="${escaped}"`;
    }
    return `${key}=${val}`;
  });

  const result = lines.join('\n');
  return addNewline && result.length > 0 ? result + '\n' : result;
}

/**
 * Merge an array of env objects into a single .env string.
 * Later entries win on conflict.
 */
function mergeToString(envs, options = {}) {
  const merged = Object.assign({}, ...envs);
  return stringifyEnv(merged, options);
}

/**
 * Round-trip an env string: parse then re-serialize.
 * Useful for normalizing formatting.
 */
function roundTrip(raw, parseEnv, options = {}) {
  const parsed = parseEnv(raw);
  return stringifyEnv(parsed, options);
}

/**
 * Diff two env strings and return the re-serialized "right" side
 * annotated with change markers as comments.
 */
function annotatedString(left, right, parseEnv) {
  const lEnv = parseEnv(left);
  const rEnv = parseEnv(right);
  const allKeys = [...new Set([...Object.keys(lEnv), ...Object.keys(rEnv)])];

  const lines = allKeys.map((key) => {
    const inL = Object.prototype.hasOwnProperty.call(lEnv, key);
    const inR = Object.prototype.hasOwnProperty.call(rEnv, key);
    if (!inL) return `# [added] ${key}=${rEnv[key]}`;
    if (!inR) return `# [removed] ${key}=${lEnv[key]}`;
    if (lEnv[key] !== rEnv[key]) return `# [changed] ${key}=${rEnv[key]}`;
    return `${key}=${rEnv[key]}`;
  });

  return lines.join('\n') + '\n';
}

module.exports = { stringifyEnv, mergeToString, roundTrip, annotatedString };
