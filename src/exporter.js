/**
 * exporter.js — Export diff results to various output formats (json, csv, markdown)
 */

/**
 * Export diff result as JSON string
 * @param {object} report - report object from compareEnvs
 * @returns {string}
 */
function exportJson(report) {
  return JSON.stringify(report, null, 2);
}

/**
 * Export diff result as CSV
 * @param {object} report
 * @returns {string}
 */
function exportCsv(report) {
  const rows = ['key,status,files'];

  for (const [key, info] of Object.entries(report)) {
    const status = info.status;
    const files = info.presentIn ? info.presentIn.join('|') : '';
    const escapedKey = key.includes(',') ? `"${key}"` : key;
    rows.push(`${escapedKey},${status},${files}`);
  }

  return rows.join('\n');
}

/**
 * Export diff result as Markdown table
 * @param {object} report
 * @returns {string}
 */
function exportMarkdown(report) {
  const lines = [
    '| Key | Status | Present In |',
    '|-----|--------|------------|',
  ];

  for (const [key, info] of Object.entries(report)) {
    const status = info.status;
    const files = info.presentIn ? info.presentIn.join(', ') : '';
    lines.push(`| ${key} | ${status} | ${files} |`);
  }

  return lines.join('\n');
}

/**
 * Dispatch to the right exporter based on format string
 * @param {object} report
 * @param {'json'|'csv'|'markdown'} format
 * @returns {string}
 */
function exportReport(report, format) {
  switch (format) {
    case 'json':
      return exportJson(report);
    case 'csv':
      return exportCsv(report);
    case 'markdown':
      return exportMarkdown(report);
    default:
      throw new Error(`Unsupported export format: "${format}"`);
  }
}

module.exports = { exportJson, exportCsv, exportMarkdown, exportReport };
