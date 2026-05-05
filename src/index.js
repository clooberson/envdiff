const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { compareEnvs } = require('./comparator');
const { formatReport } = require('./reporter');
const { sortGrouped } = require('./sorter');

/**
 * Load and parse a .env file from disk.
 * @param {string} filePath
 * @returns {Object} parsed key-value map
 */
function loadEnvFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const content = fs.readFileSync(resolved, 'utf8');
  return parseEnv(content);
}

/**
 * Diff two .env files and return a formatted report string.
 * @param {string} baseFile - path to the base .env file
 * @param {string} compareFile - path to the file to compare against
 * @param {Object} [options]
 * @param {boolean} [options.sort=false] - sort and group results by status
 * @param {boolean} [options.color=true] - colorize output
 * @returns {string} formatted report
 */
function diffFiles(baseFile, compareFile, options = {}) {
  const { sort = false, color = true } = options;

  const base = loadEnvFile(baseFile);
  const compare = loadEnvFile(compareFile);

  let result = compareEnvs(base, compare);

  if (sort) {
    result = { ...result, entries: sortGrouped(result.entries) };
  }

  return formatReport(result, { color });
}

module.exports = { loadEnvFile, diffFiles };
