// squasher.js — collapse multiple env objects into one, resolving conflicts by strategy

/**
 * Strategies: 'first' | 'last' | 'error'
 * @param {string} key
 * @param {string[]} values
 * @param {'first'|'last'|'error'} strategy
 * @returns {string}
 */
function resolveConflict(key, values, strategy = 'last') {
  const distinct = [...new Set(values)];
  if (distinct.length === 1) return distinct[0];
  if (strategy === 'first') return values[0];
  if (strategy === 'last') return values[values.length - 1];
  if (strategy === 'error') {
    throw new Error(`Conflict on key "${key}": ${distinct.map(v => JSON.stringify(v)).join(', ')}`);
  }
  return values[values.length - 1];
}

/**
 * Squash an array of env objects into a single flat env.
 * @param {Record<string,string>[]} envs
 * @param {'first'|'last'|'error'} strategy
 * @returns {Record<string,string>}
 */
function squashEnvs(envs, strategy = 'last') {
  const collected = {};
  for (const env of envs) {
    for (const [k, v] of Object.entries(env)) {
      if (!collected[k]) collected[k] = [];
      collected[k].push(v);
    }
  }
  const result = {};
  for (const [k, vals] of Object.entries(collected)) {
    result[k] = resolveConflict(k, vals, strategy);
  }
  return result;
}

/**
 * Returns keys that had conflicting values across envs.
 * @param {Record<string,string>[]} envs
 * @returns {string[]}
 */
function findSquashConflicts(envs) {
  const collected = {};
  for (const env of envs) {
    for (const [k, v] of Object.entries(env)) {
      if (!collected[k]) collected[k] = new Set();
      collected[k].add(v);
    }
  }
  return Object.entries(collected)
    .filter(([, s]) => s.size > 1)
    .map(([k]) => k);
}

/**
 * Build a summary of the squash operation.
 * @param {Record<string,string>[]} envs
 * @param {Record<string,string>} result
 * @param {'first'|'last'|'error'} strategy
 * @returns {object}
 */
function buildSquashSummary(envs, result, strategy) {
  const conflicts = findSquashConflicts(envs);
  return {
    inputCount: envs.length,
    outputKeys: Object.keys(result).length,
    conflictKeys: conflicts,
    conflictCount: conflicts.length,
    strategy,
  };
}

module.exports = { resolveConflict, squashEnvs, findSquashConflicts, buildSquashSummary };
