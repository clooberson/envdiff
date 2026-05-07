/**
 * renamer.js — rename keys across one or more env maps
 */

/**
 * Rename a single key in an env map.
 * Returns a new map; original is not mutated.
 * @param {Record<string,string>} env
 * @param {string} oldKey
 * @param {string} newKey
 * @returns {Record<string,string>}
 */
function renameKey(env, oldKey, newKey) {
  if (!Object.prototype.hasOwnProperty.call(env, oldKey)) {
    return { ...env };
  }
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    result[k === oldKey ? newKey : k] = v;
  }
  return result;
}

/**
 * Apply a rename map (oldKey -> newKey) to an env object.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} renames
 * @returns {Record<string,string>}
 */
function applyRenames(env, renames) {
  let result = { ...env };
  for (const [oldKey, newKey] of Object.entries(renames)) {
    result = renameKey(result, oldKey, newKey);
  }
  return result;
}

/**
 * Apply the same rename map to multiple env maps.
 * @param {Record<string, Record<string,string>>} envs  label -> env
 * @param {Record<string,string>} renames
 * @returns {Record<string, Record<string,string>>}
 */
function renameAll(envs, renames) {
  const result = {};
  for (const [label, env] of Object.entries(envs)) {
    result[label] = applyRenames(env, renames);
  }
  return result;
}

/**
 * Build a summary of what was renamed.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} renames
 * @returns {{ renamed: string[], skipped: string[] }}
 */
function renameSummary(env, renames) {
  const renamed = [];
  const skipped = [];
  for (const oldKey of Object.keys(renames)) {
    if (Object.prototype.hasOwnProperty.call(env, oldKey)) {
      renamed.push(oldKey);
    } else {
      skipped.push(oldKey);
    }
  }
  return { renamed, skipped };
}

module.exports = { renameKey, applyRenames, renameAll, renameSummary };
