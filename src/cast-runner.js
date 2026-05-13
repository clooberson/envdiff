// cast-runner.js — CLI runner for the caster module
const fs = require('fs');
const { loadEnvFile } = require('./index');
const { castEnv, castDiff, buildCastSummary } = require('./caster');

function formatCastDiff(diff) {
  const lines = [];
  for (const [key, { original, casted }] of Object.entries(diff)) {
    const castedStr = casted === null ? 'null' : casted === undefined ? 'undefined' : String(casted);
    lines.push(`  ${key}: "${original}" → ${typeof casted} (${castedStr})`);
  }
  return lines.join('\n');
}

function formatCastSummary(summary) {
  const parts = [];
  if (summary.boolean) parts.push(`${summary.boolean} boolean`);
  if (summary.number) parts.push(`${summary.number} number`);
  if (summary.null) parts.push(`${summary.null} null`);
  if (summary.undefined) parts.push(`${summary.undefined} undefined`);
  if (summary.unchanged) parts.push(`${summary.unchanged} unchanged`);
  return `Cast summary: ${parts.join(', ')}`;
}

function runCast(filePath) {
  const env = loadEnvFile(filePath);
  const diff = castDiff(env);
  const summary = buildCastSummary(env);
  const diffCount = Object.keys(diff).length;

  const lines = [];
  lines.push(`File: ${filePath}`);
  if (diffCount === 0) {
    lines.push('  No values would be cast (all strings).');
  } else {
    lines.push(`  ${diffCount} value(s) would be cast:`);
    lines.push(formatCastDiff(diff));
  }
  lines.push(formatCastSummary(summary));
  return lines.join('\n');
}

module.exports = { formatCastDiff, formatCastSummary, runCast };
