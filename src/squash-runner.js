// squash-runner.js — CLI runner for the squasher module
const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./index');
const { squashEnvs, findSquashConflicts, buildSquashSummary } = require('./squasher');
const { serializeEnv } = require('./patcher');

/**
 * Format a conflict warning line.
 * @param {string} key
 * @returns {string}
 */
function formatConflict(key) {
  return `  ! conflict: ${key}`;
}

/**
 * Format the squash summary for display.
 * @param {object} summary
 * @returns {string}
 */
function formatSquashSummary(summary) {
  const lines = [
    `Squashed ${summary.inputCount} file(s) → ${summary.outputKeys} key(s) [strategy: ${summary.strategy}]`,
  ];
  if (summary.conflictCount > 0) {
    lines.push(`Conflicts (${summary.conflictCount}):`);
    summary.conflictKeys.forEach(k => lines.push(formatConflict(k)));
  } else {
    lines.push('No conflicts.');
  }
  return lines.join('\n');
}

/**
 * Run squash over a list of file paths.
 * @param {string[]} filePaths
 * @param {{ strategy?: string, output?: string }} opts
 * @returns {{ result: Record<string,string>, summary: object, report: string }}
 */
function runSquash(filePaths, opts = {}) {
  const strategy = opts.strategy || 'last';
  const envs = filePaths.map(fp => loadEnvFile(fp));
  const result = squashEnvs(envs, strategy);
  const summary = buildSquashSummary(envs, result, strategy);
  const report = formatSquashSummary(summary);

  if (opts.output) {
    const serialized = serializeEnv(result);
    fs.writeFileSync(path.resolve(opts.output), serialized, 'utf8');
  }

  return { result, summary, report };
}

module.exports = { formatConflict, formatSquashSummary, runSquash };
