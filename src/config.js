'use strict';

const path = require('path');
const fs = require('fs');

const CONFIG_FILENAME = '.envdiffrc.json';

const DEFAULTS = {
  ignoreKeys: [],
  ignoreValues: false,
  color: true,
  format: 'text',
  exitOnMismatch: true,
};

/**
 * Searches upward from cwd for a .envdiffrc.json config file.
 * @param {string} [startDir]
 * @returns {string|null}
 */
function findConfigFile(startDir = process.cwd()) {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, CONFIG_FILENAME);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Loads and merges config from .envdiffrc.json if present.
 * @param {string} [startDir]
 * @returns {object}
 */
function loadConfig(startDir) {
  const configPath = findConfigFile(startDir);
  if (!configPath) return { ...DEFAULTS };

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch (err) {
    throw new Error(`Failed to parse config at ${configPath}: ${err.message}`);
  }
}

/**
 * Validates a config object and throws on unknown keys.
 * @param {object} config
 */
function validateConfig(config) {
  const allowed = new Set(Object.keys(DEFAULTS));
  for (const key of Object.keys(config)) {
    if (!allowed.has(key)) {
      throw new Error(`Unknown config key: "${key}"`);
    }
  }
  if (!Array.isArray(config.ignoreKeys)) {
    throw new Error('Config "ignoreKeys" must be an array');
  }
}

module.exports = { loadConfig, validateConfig, findConfigFile, DEFAULTS };
