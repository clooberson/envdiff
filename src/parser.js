/**
 * Parses the contents of a .env file into a key-value map.
 * Handles comments, blank lines, quoted values, and inline comments.
 */

/**
 * @param {string} content - Raw string content of a .env file
 * @returns {Record<string, string>} - Parsed key-value pairs
 */
function parseEnv(content) {
  const result = {};

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Strip inline comments (only outside quotes)
    value = stripInlineComment(value);

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Removes inline comments from a value string, respecting quoted sections.
 * @param {string} value
 * @returns {string}
 */
function stripInlineComment(value) {
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];

    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = true;
      quoteChar = ch;
    } else if (inQuote && ch === quoteChar) {
      inQuote = false;
    } else if (!inQuote && ch === '#') {
      return value.slice(0, i).trim();
    }
  }

  return value;
}

module.exports = { parseEnv };
