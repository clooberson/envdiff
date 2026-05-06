/**
 * resolver.js
 * Resolves variable references within and across env files.
 * Supports ${VAR} style interpolation.
 */

/**
 * Resolve a single value by expanding ${VAR} references using the provided env map.
 * Unresolved references are left as-is.
 * @param {string} value
 * @param {Record<string, string>} env
 * @returns {string}
 */
function resolveValue(value, env) {
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{([^}]+)\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : match;
  });
}

/**
 * Resolve all values in an env object, expanding references to other keys.
 * Performs a single pass — nested references are not recursively resolved.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function resolveEnv(env) {
  const resolved = {};
  for (const [key, value] of Object.entries(env)) {
    resolved[key] = resolveValue(value, env);
  }
  return resolved;
}

/**
 * Find all keys whose values contain unresolved ${VAR} references after resolution.
 * @param {Record<string, string>} env
 * @returns {string[]}
 */
function findUnresolved(env) {
  const resolved = resolveEnv(env);
  const unresolved = [];
  for (const [key, value] of Object.entries(resolved)) {
    if (/\$\{[^}]+\}/.test(value)) {
      unresolved.push(key);
    }
  }
  return unresolved;
}

/**
 * Resolve values in env using an optional external context (e.g. process.env).
 * Keys in context take lower priority than keys in env itself.
 * @param {Record<string, string>} env
 * @param {Record<string, string>} context
 * @returns {Record<string, string>}
 */
function resolveWithContext(env, context = {}) {
  const merged = Object.assign({}, context, env);
  const resolved = {};
  for (const [key, value] of Object.entries(env)) {
    resolved[key] = resolveValue(value, merged);
  }
  return resolved;
}

module.exports = { resolveValue, resolveEnv, findUnresolved, resolveWithContext };
