/**
 * Formats a DiffResult into human-readable output.
 */

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';

function colorize(text, color, useColor = true) {
  return useColor ? `${color}${text}${RESET}` : text;
}

/**
 * Format a diff result as a plain text / ANSI report string.
 * @param {import('./comparator').DiffResult} diff
 * @param {Object} [options]
 * @param {string} [options.labelA='A'] - Label for the first env file
 * @param {string} [options.labelB='B'] - Label for the second env file
 * @param {boolean} [options.color=true] - Whether to emit ANSI color codes
 * @returns {string}
 */
function formatReport(diff, options = {}) {
  const { labelA = 'A', labelB = 'B', color = true } = options;
  const lines = [];

  if (diff.missingInB.length > 0) {
    lines.push(colorize(`\nMissing in ${labelB}:`, BOLD, color));
    for (const key of diff.missingInB) {
      lines.push(colorize(`  - ${key}`, RED, color));
    }
  }

  if (diff.missingInA.length > 0) {
    lines.push(colorize(`\nMissing in ${labelA}:`, BOLD, color));
    for (const key of diff.missingInA) {
      lines.push(colorize(`  - ${key}`, RED, color));
    }
  }

  if (diff.mismatched.length > 0) {
    lines.push(colorize('\nMismatched values:', BOLD, color));
    for (const { key, valueA, valueB } of diff.mismatched) {
      lines.push(colorize(`  ~ ${key}`, YELLOW, color));
      lines.push(`      ${labelA}: ${valueA}`);
      lines.push(`      ${labelB}: ${valueB}`);
    }
  }

  if (lines.length === 0) {
    lines.push(colorize('✓ No differences found.', GREEN, color));
  } else {
    const issues =
      diff.missingInB.length + diff.missingInA.length + diff.mismatched.length;
    lines.push(
      colorize(`\n${issues} issue(s) found.`, BOLD, color)
    );
  }

  return lines.join('\n');
}

module.exports = { formatReport };
