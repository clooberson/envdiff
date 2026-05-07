// audit-runner.js — CLI runner for the auditor module

const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');
const { auditEnv, buildAuditSummary } = require('./auditor');
const { colorize } = require('./reporter');

const ICONS = { error: '✖', warn: '⚠', info: 'ℹ' };
const COLORS = { error: 'red', warn: 'yellow', info: 'cyan' };

function formatIssue(issue) {
  const icon = ICONS[issue.severity] || '?';
  const label = colorize(`[${issue.severity.toUpperCase()}]`, COLORS[issue.severity] || 'reset');
  return `  ${icon} ${label} ${issue.code}: ${issue.message}`;
}

function formatAuditReport(filePath, issues, summary) {
  const lines = [];
  lines.push(colorize(`\nAudit: ${filePath}`, 'bold'));
  if (summary.clean) {
    lines.push(colorize('  ✔ No issues found.', 'green'));
  } else {
    for (const issue of issues) lines.push(formatIssue(issue));
    lines.push('');
    lines.push(`  Total: ${summary.total} issue(s) — errors: ${summary.counts.error || 0}, warnings: ${summary.counts.warn || 0}, info: ${summary.counts.info || 0}`);
  }
  return lines.join('\n');
}

function runAudit(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`File not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  const env = parseEnv(raw);
  const issues = auditEnv(env);
  const summary = buildAuditSummary(issues);
  return { filePath, env, issues, summary };
}

module.exports = { formatIssue, formatAuditReport, runAudit };
