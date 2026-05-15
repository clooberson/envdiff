// scope-runner.js — CLI runner for scoped env diffing

const { loadEnvFile } = require('./index');
const { listScopes, scopeDiff } = require('./scoper');
const { colorize } = require('./reporter');

/**
 * Format a single scope diff result into a human-readable string.
 * @param {Object} result
 * @returns {string}
 */
function formatScopeDiff(result) {
  const lines = [];
  lines.push(colorize('bold', `[${result.scope}]`));
  if (result.only_a.length)
    lines.push(colorize('yellow', `  only in A: ${result.only_a.join(', ')}`) );
  if (result.only_b.length)
    lines.push(colorize('yellow', `  only in B: ${result.only_b.join(', ')}`) );
  if (result.diff.length)
    lines.push(colorize('red', `  value mismatch: ${result.diff.join(', ')}`) );
  if (!result.only_a.length && !result.only_b.length && !result.diff.length)
    lines.push(colorize('green', '  ✓ in sync'));
  return lines.join('\n');
}

/**
 * Run a scoped diff between two env files, optionally limited to one scope.
 * @param {string} fileA
 * @param {string} fileB
 * @param {string|null} scope  — if null, all scopes are compared
 * @returns {string}
 */
function runScopeDiff(fileA, fileB, scope = null) {
  const envA = loadEnvFile(fileA);
  const envB = loadEnvFile(fileB);

  const scopes = scope
    ? [scope]
    : Array.from(new Set([...listScopes(envA), ...listScopes(envB)]));

  if (scopes.length === 0) {
    return colorize('yellow', 'No scoped keys found in either file.');
  }

  return scopes
    .sort()
    .map(s => formatScopeDiff(scopeDiff(envA, envB, s)))
    .join('\n\n');
}

module.exports = { formatScopeDiff, runScopeDiff };
