/**
 * envdiff public API — ties together parsing, comparing, and reporting.
 */

const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { compareEnvs, isClean } = require('./comparator');
const { formatReport } = require('./reporter');

/**
 * Load and parse an env file from disk.
 * @param {string} filePath
 * @returns {Record<string, string>}
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
 * Compare two env files and return a formatted report string.
 * @param {string} fileA - Path to the first .env file
 * @param {string} fileB - Path to the second .env file
 * @param {Object} [options]
 * @param {boolean} [options.ignoreValues=false]
 * @param {boolean} [options.color=true]
 * @returns {{ report: string, clean: boolean }}
 */
function diffFiles(fileA, fileB, options = {}) {
  const { ignoreValues = false, color = true } = options;

  const envA = loadEnvFile(fileA);
  const envB = loadEnvFile(fileB);

  const labelA = path.basename(fileA);
  const labelB = path.basename(fileB);

  const diff = compareEnvs(envA, envB, { ignoreValues });
  const report = formatReport(diff, { labelA, labelB, color });
  const clean = isClean(diff);

  return { report, clean, diff };
}

module.exports = { diffFiles, loadEnvFile, compareEnvs, isClean, formatReport };
