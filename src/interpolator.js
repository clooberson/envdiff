/**
 * interpolator.js
 * Handles variable interpolation in .env values (e.g. FOO=${BAR}_suffix)
 */

/**
 * Expand a single value string using a context map.
 * Supports ${VAR} and $VAR syntax.
 * @param {string} value
 * @param {Record<string, string>} context
 * @returns {string}
 */
function interpolateValue(value, context) {
  if (typeof value !== 'string') return value;

  // Replace ${VAR} style
  let result = value.replace(/\$\{([^}]+)\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(context, key)
      ? context[key]
      : '';
  });

  // Replace $VAR style (not followed by { )
  result = result.replace(/\$([A-Z_][A-Z0-9_]*)/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(context, key)
      ? context[key]
      : '';
  });

  return result;
}

/**
 * Interpolate all values in an env map using the same map as context.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function interpolateEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = interpolateValue(value, env);
  }
  return result;
}

/**
 * Find keys whose values reference variables not present in the env.
 * @param {Record<string, string>} env
 * @returns {Array<{key: string, refs: string[]}>}
 */
function findUnresolvedRefs(env) {
  const unresolved = [];
  const refPattern = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g;

  for (const [key, value] of Object.entries(env)) {
    if (typeof value !== 'string') continue;
    const refs = [];
    let match;
    while ((match = refPattern.exec(value)) !== null) {
      const ref = match[1] || match[2];
      if (!Object.prototype.hasOwnProperty.call(env, ref)) {
        refs.push(ref);
      }
    }
    if (refs.length > 0) {
      unresolved.push({ key, refs });
    }
  }

  return unresolved;
}

module.exports = { interpolateValue, interpolateEnv, findUnresolvedRefs };
