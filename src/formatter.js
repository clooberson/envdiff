'use strict';

/**
 * Formats diff results as a plain-text summary table.
 * @param {object} result - Output from compareEnvs
 * @param {object} opts
 * @param {string} [opts.label] - Optional file label
 * @returns {string}
 */
function formatTable(result, opts = {}) {
  const { missing = [], mismatched = [], extra = [] } = result;
  const label = opts.label ? ` (${opts.label})` : '';
  const lines = [`envdiff report${label}`];
  lines.push('='.repeat(40));

  if (missing.length === 0 && mismatched.length === 0 && extra.length === 0) {
    lines.push('✓ No differences found.');
    return lines.join('\n');
  }

  if (missing.length > 0) {
    lines.push(`\nMissing keys (${missing.length}):`);
    missing.forEach(k => lines.push(`  - ${k}`));
  }

  if (mismatched.length > 0) {
    lines.push(`\nMismatched keys (${mismatched.length}):`);
    mismatched.forEach(({ key, baseValue, compareValue }) => {
      lines.push(`  ~ ${key}`);
      lines.push(`      base:    ${baseValue}`);
      lines.push(`      compare: ${compareValue}`);
    });
  }

  if (extra.length > 0) {
    lines.push(`\nExtra keys in compare (${extra.length}):`);
    extra.forEach(k => lines.push(`  + ${k}`));
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Formats diff results as a GitHub Actions annotation-style output.
 * @param {object} result
 * @returns {string}
 */
function formatAnnotations(result) {
  const { missing = [], mismatched = [] } = result;
  const lines = [];
  missing.forEach(k => lines.push(`::warning::Missing key: ${k}`));
  mismatched.forEach(({ key }) => lines.push(`::warning::Mismatched value for key: ${key}`));
  return lines.join('\n');
}

module.exports = { formatTable, formatAnnotations };
