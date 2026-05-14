// semver.js — compare env values that look like semver strings

const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:[-.].+)?$/;

/**
 * Parse a semver string into { major, minor, patch } or null if not semver.
 */
function parseSemver(value) {
  const m = String(value).trim().match(SEMVER_RE);
  if (!m) return null;
  return {
    major: parseInt(m[1], 10),
    minor: parseInt(m[2], 10),
    patch: parseInt(m[3], 10),
    raw: value,
  };
}

/**
 * Returns 'major' | 'minor' | 'patch' | 'equal' | null
 * null means one or both values are not semver.
 */
function semverDiff(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return null;
  if (pa.major !== pb.major) return 'major';
  if (pa.minor !== pb.minor) return 'minor';
  if (pa.patch !== pb.patch) return 'patch';
  return 'equal';
}

/**
 * Scan two parsed env objects and return an array of semver diff entries.
 * Each entry: { key, a, b, diff }
 */
function semverDiffEnvs(envA, envB) {
  const keys = new Set([...Object.keys(envA), ...Object.keys(envB)]);
  const results = [];

  for (const key of keys) {
    const a = envA[key];
    const b = envB[key];
    if (a === undefined || b === undefined) continue;
    const d = semverDiff(a, b);
    if (d === null) continue; // not semver values
    results.push({ key, a, b, diff: d });
  }

  return results;
}

/**
 * Format semver diff results as a human-readable string.
 */
function formatSemverDiff(rows) {
  if (rows.length === 0) return 'No semver differences found.';
  const lines = rows.map((r) => {
    const label = r.diff === 'equal' ? '=' : `↑${r.diff}`;
    return `  ${r.key}: ${r.a} → ${r.b} [${label}]`;
  });
  return `Semver diffs (${rows.length}):\n` + lines.join('\n');
}

module.exports = { parseSemver, semverDiff, semverDiffEnvs, formatSemverDiff };
