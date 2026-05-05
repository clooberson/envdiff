/**
 * Orchestrates loading an env file and running validation against a schema.
 */

const { loadEnvFile } = require('./index');
const { validateEnv, getFailures, isValid } = require('./validator');
const { colorize } = require('./reporter');

/**
 * Format a single validation failure for display.
 * @param {{ key, rule, value }} failure
 * @returns {string}
 */
function formatFailure({ key, rule, value }) {
  const displayVal = value === '' ? '(empty)' : `"${value}"`;
  return colorize('red', `  ✗ ${key}: ${displayVal} failed rule [${rule}]`);
}

/**
 * Format a validation summary line.
 * @param {number} total
 * @param {number} failCount
 * @returns {string}
 */
function formatSummary(total, failCount) {
  if (failCount === 0) {
    return colorize('green', `✔ All ${total} validation(s) passed.`);
  }
  return colorize('red', `✘ ${failCount} of ${total} validation(s) failed.`);
}

/**
 * Run validation on an env file against a schema and return a report.
 * @param {string} filePath
 * @param {Object} schema
 * @returns {{ passed: boolean, output: string }}
 */
function runValidation(filePath, schema) {
  let envMap;
  try {
    envMap = loadEnvFile(filePath);
  } catch (err) {
    return {
      passed: false,
      output: colorize('red', `Error loading file "${filePath}": ${err.message}`),
    };
  }

  const results = validateEnv(envMap, schema);
  const failures = getFailures(results);
  const lines = [];

  if (failures.length > 0) {
    lines.push(colorize('yellow', `Validation failures in ${filePath}:`));
    failures.forEach((f) => lines.push(formatFailure(f)));
  }

  lines.push(formatSummary(results.length, failures.length));

  return {
    passed: isValid(results),
    output: lines.join('\n'),
  };
}

module.exports = { runValidation, formatFailure, formatSummary };
