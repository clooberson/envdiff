/**
 * profiler.js — profile .env files to summarize key statistics
 */

/**
 * Count keys by status from a diff result
 * @param {Object} grouped - grouped diff result from groupByStatus
 * @returns {Object} counts per status
 */
function countByStatus(grouped) {
  const counts = {};
  for (const [status, entries] of Object.entries(grouped)) {
    counts[status] = Array.isArray(entries) ? entries.length : 0;
  }
  return counts;
}

/**
 * Calculate what percentage of keys are shared (present in all envs)
 * @param {Object} counts - result of countByStatus
 * @returns {number} percentage 0-100
 */
function sharedPercent(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return 100;
  const shared = counts.shared || 0;
  return Math.round((shared / total) * 100);
}

/**
 * List keys that appear in only one environment
 * @param {Object} grouped - grouped diff result
 * @returns {string[]} unique key names
 */
function uniqueKeys(grouped) {
  const unique = [];
  for (const [status, entries] of Object.entries(grouped)) {
    if (status === 'shared' || status === 'mismatched') continue;
    if (Array.isArray(entries)) {
      entries.forEach(e => unique.push(e.key));
    }
  }
  return unique;
}

/**
 * Build a full profile summary from a grouped diff
 * @param {Object} grouped - grouped diff result
 * @param {string[]} envNames - environment labels
 * @returns {Object} profile report
 */
function buildProfile(grouped, envNames = []) {
  const counts = countByStatus(grouped);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    envCount: envNames.length,
    envNames,
    totalKeys: total,
    counts,
    sharedPercent: sharedPercent(counts),
    uniqueKeys: uniqueKeys(grouped),
    healthy: (counts.mismatched || 0) === 0 && uniqueKeys(grouped).length === 0,
  };
}

module.exports = { countByStatus, sharedPercent, uniqueKeys, buildProfile };
