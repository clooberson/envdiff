/**
 * differ.js — high-level diff orchestration combining parse, compare, sort, and filter
 */

const { parseEnv } = require('./parser');
const { compareEnvs } = require('./comparator');
const { sortGrouped, groupByStatus } = require('./sorter');
const { filterByKeys, filterExcludeKeys } = require('./filter');

/**
 * Run a full diff between two raw env strings.
 * @param {string} baseContent  - raw content of the base .env file
 * @param {string} targetContent - raw content of the target .env file
 * @param {object} options
 * @param {string[]} [options.include]  - only include these keys
 * @param {string[]} [options.exclude]  - exclude these keys
 * @param {boolean} [options.sorted]    - sort output by key name
 * @returns {{ results: object[], summary: object }}
 */
function runDiff(baseContent, targetContent, options = {}) {
  const base = parseEnv(baseContent);
  const target = parseEnv(targetContent);

  let results = compareEnvs(base, target);

  if (options.include && options.include.length > 0) {
    results = filterByKeys(results, options.include);
  }

  if (options.exclude && options.exclude.length > 0) {
    results = filterExcludeKeys(results, options.exclude);
  }

  const grouped = groupByStatus(results);
  const ordered = options.sorted ? sortGrouped(grouped) : grouped;

  const summary = buildSummary(ordered);

  return { results: flattenGrouped(ordered), grouped: ordered, summary };
}

/**
 * Flatten grouped results back into a single array.
 */
function flattenGrouped(grouped) {
  return Object.values(grouped).flat();
}

/**
 * Build a summary object from grouped results.
 */
function buildSummary(grouped) {
  const summary = { total: 0 };
  for (const [status, items] of Object.entries(grouped)) {
    summary[status] = items.length;
    summary.total += items.length;
  }
  return summary;
}

module.exports = { runDiff, flattenGrouped, buildSummary };
