/**
 * patch-runner.js — CLI-facing runner for the patch feature
 */

const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./index');
const { compareEnvs } = require('./comparator');
const { applyPatch, serializeEnv, patchSummary } = require('./patcher');

/**
 * Run a patch operation: load base + source, apply diff, write output.
 *
 * @param {string} baseFile - path to base .env file
 * @param {string} sourceFile - path to source .env file
 * @param {string|null} outputFile - path to write patched file, or null for stdout
 * @returns {{ summary: Object, content: string }}
 */
function runPatch(baseFile, sourceFile, outputFile = null) {
  const base = loadEnvFile(baseFile);
  const source = loadEnvFile(sourceFile);

  const diff = compareEnvs(base, source);
  const patched = applyPatch(base, diff, source);
  const content = serializeEnv(patched);
  const summary = patchSummary(diff);

  if (outputFile) {
    const resolved = path.resolve(outputFile);
    fs.writeFileSync(resolved, content, 'utf8');
  }

  return { summary, content };
}

/**
 * Format a human-readable patch summary line.
 *
 * @param {Object} summary
 * @returns {string}
 */
function formatPatchSummary(summary) {
  const parts = [];
  if (summary.added > 0) parts.push(`${summary.added} key(s) added`);
  if (summary.updated > 0) parts.push(`${summary.updated} key(s) updated`);
  if (parts.length === 0) return 'No changes applied.';
  return `Patch applied: ${parts.join(', ')}.`;
}

module.exports = { runPatch, formatPatchSummary };
