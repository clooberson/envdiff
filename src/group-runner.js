/**
 * group-runner.js — CLI-facing runner for grouping env keys by prefix
 */

const { loadEnvFile } = require('./index');
const { groupByPrefix, groupKeysAcrossEnvs, buildGroupSummary } = require('./grouper');

/**
 * Format a single env's group breakdown as a string
 * @param {Object} grouped
 * @returns {string}
 */
function formatGroups(grouped) {
  const lines = [];
  for (const [prefix, keys] of Object.entries(grouped).sort()) {
    const keyList = Object.keys(keys).sort().join(', ');
    lines.push(`  [${prefix}] (${Object.keys(keys).length}) ${keyList}`);
  }
  return lines.join('\n');
}

/**
 * Format a cross-env group summary
 * @param {Object} crossGroups - result of groupKeysAcrossEnvs
 * @param {string[]} labels
 * @returns {string}
 */
function formatCrossGroups(crossGroups, labels) {
  const lines = [`Groups across: ${labels.join(', ')}`, ''];
  for (const [prefix, keys] of Object.entries(crossGroups).sort()) {
    lines.push(`  [${prefix}] (${keys.length}) ${keys.join(', ')}`);
  }
  return lines.join('\n');
}

/**
 * Run grouping on one or more env files
 * @param {string[]} filePaths
 * @param {Object} options - { sep, cross }
 * @returns {{ output: string, summary: Object }}
 */
function runGroup(filePaths, options = {}) {
  const sep = options.sep || '_';
  const envs = filePaths.map(fp => loadEnvFile(fp));

  if (envs.length === 1 && !options.cross) {
    const grouped = groupByPrefix(envs[0], sep);
    const summary = buildGroupSummary(grouped);
    const output = [`Groups in ${filePaths[0]}:`, '', formatGroups(grouped)].join('\n');
    return { output, summary };
  }

  const crossGroups = groupKeysAcrossEnvs(envs, sep);
  const summary = buildGroupSummary(crossGroups);
  const output = formatCrossGroups(crossGroups, filePaths);
  return { output, summary };
}

module.exports = { formatGroups, formatCrossGroups, runGroup };
