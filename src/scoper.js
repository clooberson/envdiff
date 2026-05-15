// scoper.js — filter and project env keys by scope/namespace prefix

/**
 * Extract all keys that belong to a given scope (prefix).
 * e.g. scope 'DB' matches DB_HOST, DB_PORT, etc.
 * @param {Object} env
 * @param {string} scope
 * @returns {Object}
 */
function scopeEnv(env, scope) {
  const prefix = scope.endsWith('_') ? scope : `${scope}_`;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Strip the scope prefix from all keys, returning short names.
 * e.g. { DB_HOST: 'localhost' } -> { HOST: 'localhost' }
 * @param {Object} env
 * @param {string} scope
 * @returns {Object}
 */
function stripScope(env, scope) {
  const prefix = scope.endsWith('_') ? scope : `${scope}_`;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    }
  }
  return result;
}

/**
 * List all distinct scopes present in an env object.
 * A scope is the part before the first underscore.
 * @param {Object} env
 * @returns {string[]}
 */
function listScopes(env) {
  const scopes = new Set();
  for (const key of Object.keys(env)) {
    const idx = key.indexOf('_');
    if (idx > 0) {
      scopes.add(key.slice(0, idx));
    }
  }
  return Array.from(scopes).sort();
}

/**
 * Compare two envs restricted to a given scope.
 * Returns { scope, only_a, only_b, diff, shared } counts.
 * @param {Object} envA
 * @param {Object} envB
 * @param {string} scope
 * @returns {Object}
 */
function scopeDiff(envA, envB, scope) {
  const a = scopeEnv(envA, scope);
  const b = scopeEnv(envB, scope);
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));
  const only_a = [...keysA].filter(k => !keysB.has(k));
  const only_b = [...keysB].filter(k => !keysA.has(k));
  const shared = [...keysA].filter(k => keysB.has(k));
  const diff = shared.filter(k => a[k] !== b[k]);
  return { scope, only_a, only_b, diff, shared };
}

module.exports = { scopeEnv, stripScope, listScopes, scopeDiff };
