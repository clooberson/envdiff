/**
 * deduper.js — detect and remove duplicate keys within a single env object
 * (last-write-wins semantics match most dotenv parsers)
 */

/**
 * Find keys that appear more than once in raw lines of an env file.
 * Returns a map of key -> array of line numbers (1-based).
 * @param {string} raw - raw file content
 * @returns {Record<string, number[]>}
 */
function findDuplicateLines(raw) {
  const lines = raw.split(/\r?\n/);
  const seen = {};
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) return;
    const key = match[1];
    if (!seen[key]) seen[key] = [];
    seen[key].push(idx + 1);
  });
  return Object.fromEntries(
    Object.entries(seen).filter(([, lines]) => lines.length > 1)
  );
}

/**
 * Given a parsed env object (already deduplicated by last-write-wins),
 * return only the keys that had duplicates.
 * @param {Record<string, string>} env
 * @param {Record<string, number[]>} dupMap - output of findDuplicateLines
 * @returns {string[]}
 */
function duplicateKeys(env, dupMap) {
  return Object.keys(dupMap).filter((k) => k in env);
}

/**
 * Remove duplicate keys from a parsed env, keeping only the specified strategy.
 * strategy: 'last' (default) | 'first'
 * @param {Record<string, string[]>} envMulti - key -> all values in order
 * @param {'first'|'last'} strategy
 * @returns {Record<string, string>}
 */
function dedupeEnv(envMulti, strategy = 'last') {
  const result = {};
  for (const [key, values] of Object.entries(envMulti)) {
    result[key] = strategy === 'first' ? values[0] : values[values.length - 1];
  }
  return result;
}

/**
 * Build a summary report of duplicates found.
 * @param {Record<string, number[]>} dupMap
 * @returns {{ totalKeys: number, duplicateKeys: string[], details: Record<string, number[]> }}
 */
function buildDedupeSummary(dupMap) {
  const keys = Object.keys(dupMap);
  return {
    totalKeys: keys.length,
    duplicateKeys: keys,
    details: dupMap,
  };
}

module.exports = { findDuplicateLines, duplicateKeys, dedupeEnv, buildDedupeSummary };
