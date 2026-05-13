const { loadEnvFile } = require('./index');
const { runDiff, buildSummary } = require('./differ');
const { colorize } = require('./reporter');
const { redactDiff } = require('./redactor');

/**
 * Format a single diff row for console output.
 * @param {object} row
 * @param {boolean} noColor
 * @returns {string}
 */
function formatDiffRow(row, noColor = false) {
  const statusColors = {
    missing: 'red',
    extra: 'yellow',
    mismatch: 'cyan',
    ok: 'green',
  };
  const color = statusColors[row.status] || 'reset';
  const keyPart = row.key.padEnd(30);
  const statusPart = `[${row.status.toUpperCase()}]`.padEnd(12);
  const valuePart =
    row.status === 'mismatch'
      ? `${row.baseValue} → ${row.compareValue}`
      : row.baseValue ?? row.compareValue ?? '';
  const line = `  ${keyPart} ${statusPart} ${valuePart}`;
  return noColor ? line : colorize(line, color);
}

/**
 * Format the summary block.
 * @param {object} summary
 * @returns {string}
 */
function formatDiffSummary(summary) {
  const lines = ['', 'Summary:'];
  for (const [status, count] of Object.entries(summary)) {
    lines.push(`  ${status}: ${count}`);
  }
  return lines.join('\n');
}

/**
 * Run a diff between two env files and print results.
 * @param {string} baseFile
 * @param {string} compareFile
 * @param {object} options
 */
function runDiffCommand(baseFile, compareFile, options = {}) {
  const { redact = false, noColor = false, quiet = false } = options;

  const base = loadEnvFile(baseFile);
  const compare = loadEnvFile(compareFile);

  let rows = runDiff(base, compare);

  if (redact) {
    rows = redactDiff(rows);
  }

  const summary = buildSummary(rows);

  if (!quiet) {
    console.log(`\nDiff: ${baseFile} vs ${compareFile}`);
    for (const row of rows) {
      console.log(formatDiffRow(row, noColor));
    }
    console.log(formatDiffSummary(summary));
  }

  return { rows, summary };
}

module.exports = { formatDiffRow, formatDiffSummary, runDiffCommand };
