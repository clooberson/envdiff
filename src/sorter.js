/**
 * sorter.js — sort and group diff results for output
 */

/**
 * Sort diff entries by key name alphabetically.
 * @param {Array} entries - array of diff entry objects
 * @returns {Array}
 */
function sortByKey(entries) {
  return [...entries].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Group diff entries by their status.
 * @param {Array} entries - array of diff entry objects
 * @returns {Object} grouped by status
 */
function groupByStatus(entries) {
  const groups = {
    missing: [],
    extra: [],
    mismatch: [],
    ok: [],
  };

  for (const entry of entries) {
    const status = entry.status ?? 'ok';
    if (groups[status]) {
      groups[status].push(entry);
    } else {
      groups.ok.push(entry);
    }
  }

  return groups;
}

/**
 * Sort groups internally and return a flat ordered array.
 * Order: missing → extra → mismatch → ok
 * @param {Array} entries
 * @returns {Array}
 */
function sortGrouped(entries) {
  const groups = groupByStatus(entries);
  return [
    ...sortByKey(groups.missing),
    ...sortByKey(groups.extra),
    ...sortByKey(groups.mismatch),
    ...sortByKey(groups.ok),
  ];
}

module.exports = { sortByKey, groupByStatus, sortGrouped };
