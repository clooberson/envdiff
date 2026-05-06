// snapshot.js — save and compare env snapshots over time
const fs = require('fs');
const path = require('path');

/**
 * Save a parsed env object as a JSON snapshot file.
 * @param {Object} env - parsed key/value env object
 * @param {string} snapshotPath - destination file path
 */
function saveSnapshot(env, snapshotPath) {
  const data = {
    timestamp: new Date().toISOString(),
    env,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

/**
 * Load a previously saved snapshot file.
 * @param {string} snapshotPath
 * @returns {{ timestamp: string, env: Object }}
 */
function loadSnapshot(snapshotPath) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${snapshotPath}`);
  }
  const raw = fs.readFileSync(snapshotPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Diff a current env object against a loaded snapshot.
 * Returns keys that were added, removed, or changed.
 * @param {Object} current
 * @param {Object} snapshotEnv
 * @returns {{ added: string[], removed: string[], changed: string[] }}
 */
function diffSnapshot(current, snapshotEnv) {
  const currentKeys = new Set(Object.keys(current));
  const snapshotKeys = new Set(Object.keys(snapshotEnv));

  const added = [...currentKeys].filter((k) => !snapshotKeys.has(k));
  const removed = [...snapshotKeys].filter((k) => !currentKeys.has(k));
  const changed = [...currentKeys].filter(
    (k) => snapshotKeys.has(k) && current[k] !== snapshotEnv[k]
  );

  return { added, removed, changed };
}

/**
 * Resolve a default snapshot path next to a given env file.
 * @param {string} envFilePath
 * @returns {string}
 */
function defaultSnapshotPath(envFilePath) {
  const dir = path.dirname(envFilePath);
  const base = path.basename(envFilePath);
  return path.join(dir, `.${base}.snapshot.json`);
}

module.exports = { saveSnapshot, loadSnapshot, diffSnapshot, defaultSnapshotPath };
