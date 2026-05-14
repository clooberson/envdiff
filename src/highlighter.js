/**
 * highlighter.js — Syntax-highlight .env file output for terminal display
 */

const COLORS = {
  key: '\x1b[36m',       // cyan
  equals: '\x1b[90m',   // gray
  value: '\x1b[32m',    // green
  comment: '\x1b[90m',  // gray
  blank: '',
  reset: '\x1b[0m',
};

/**
 * Highlight a single line of a .env file.
 * @param {string} line
 * @param {boolean} useColor
 * @returns {string}
 */
function highlightLine(line, useColor = true) {
  if (!useColor) return line;

  const trimmed = line.trim();

  if (trimmed === '') return line;

  if (trimmed.startsWith('#')) {
    return `${COLORS.comment}${line}${COLORS.reset}`;
  }

  const eqIndex = line.indexOf('=');
  if (eqIndex === -1) {
    return `${COLORS.key}${line}${COLORS.reset}`;
  }

  const key = line.slice(0, eqIndex);
  const value = line.slice(eqIndex + 1);

  return (
    `${COLORS.key}${key}${COLORS.reset}` +
    `${COLORS.equals}=${COLORS.reset}` +
    `${COLORS.value}${value}${COLORS.reset}`
  );
}

/**
 * Highlight all lines in a raw .env string.
 * @param {string} raw
 * @param {boolean} useColor
 * @returns {string}
 */
function highlightEnv(raw, useColor = true) {
  return raw
    .split('\n')
    .map(line => highlightLine(line, useColor))
    .join('\n');
}

/**
 * Highlight a parsed env object back as formatted text.
 * @param {Record<string, string>} env
 * @param {boolean} useColor
 * @returns {string}
 */
function highlightParsed(env, useColor = true) {
  return Object.entries(env)
    .map(([key, value]) => highlightLine(`${key}=${value}`, useColor))
    .join('\n');
}

module.exports = { highlightLine, highlightEnv, highlightParsed };
