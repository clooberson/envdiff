// auditor.js — audit env files for security and quality issues

const { isSensitiveKey } = require('./redactor');
const { lintKey, lintValue } = require('./linter');

const SEVERITY = { error: 3, warn: 2, info: 1 };

function auditEmptyValues(env) {
  const issues = [];
  for (const [key, value] of Object.entries(env)) {
    if (value === '' || value === null || value === undefined) {
      issues.push({ key, severity: 'warn', code: 'EMPTY_VALUE', message: `Key "${key}" has an empty value` });
    }
  }
  return issues;
}

function auditSensitiveDefaults(env) {
  const WEAK = ['secret', 'password', '123456', 'changeme', 'test', 'example'];
  const issues = [];
  for (const [key, value] of Object.entries(env)) {
    if (isSensitiveKey(key) && WEAK.includes(String(value).toLowerCase())) {
      issues.push({ key, severity: 'error', code: 'WEAK_SECRET', message: `Key "${key}" appears to use a weak/default secret value` });
    }
  }
  return issues;
}

function auditKeyFormat(env) {
  const issues = [];
  for (const key of Object.keys(env)) {
    const lint = lintKey(key);
    if (!lint.valid) {
      issues.push({ key, severity: 'warn', code: 'BAD_KEY_FORMAT', message: lint.reason });
    }
  }
  return issues;
}

function auditValueFormat(env) {
  const issues = [];
  for (const [key, value] of Object.entries(env)) {
    const lint = lintValue(value);
    if (!lint.valid) {
      issues.push({ key, severity: 'info', code: 'SUSPICIOUS_VALUE', message: lint.reason });
    }
  }
  return issues;
}

function auditEnv(env) {
  return [
    ...auditEmptyValues(env),
    ...auditSensitiveDefaults(env),
    ...auditKeyFormat(env),
    ...auditValueFormat(env),
  ].sort((a, b) => (SEVERITY[b.severity] || 0) - (SEVERITY[a.severity] || 0));
}

function buildAuditSummary(issues) {
  const counts = { error: 0, warn: 0, info: 0 };
  for (const i of issues) counts[i.severity] = (counts[i.severity] || 0) + 1;
  const clean = issues.length === 0;
  return { total: issues.length, counts, clean };
}

module.exports = { auditEmptyValues, auditSensitiveDefaults, auditKeyFormat, auditValueFormat, auditEnv, buildAuditSummary };
