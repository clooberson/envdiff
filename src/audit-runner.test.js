const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatIssue, formatAuditReport, runAudit } = require('./audit-runner');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envdiff-audit-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('formatIssue', () => {
  test('includes severity, code, and message', () => {
    const out = formatIssue({ severity: 'error', code: 'WEAK_SECRET', message: 'bad secret' });
    expect(out).toContain('ERROR');
    expect(out).toContain('WEAK_SECRET');
    expect(out).toContain('bad secret');
  });

  test('formats warn level', () => {
    const out = formatIssue({ severity: 'warn', code: 'EMPTY_VALUE', message: 'empty' });
    expect(out).toContain('WARN');
  });
});

describe('formatAuditReport', () => {
  test('shows clean message when no issues', () => {
    const out = formatAuditReport('test.env', [], { clean: true, total: 0, counts: {} });
    expect(out).toContain('No issues found');
  });

  test('shows issue count summary when issues exist', () => {
    const issues = [{ severity: 'error', code: 'WEAK_SECRET', message: 'bad' }];
    const summary = { clean: false, total: 1, counts: { error: 1, warn: 0, info: 0 } };
    const out = formatAuditReport('test.env', issues, summary);
    expect(out).toContain('1 issue');
    expect(out).toContain('errors: 1');
  });
});

describe('runAudit', () => {
  test('parses file and returns issues + summary', () => {
    const p = writeTmp('SECRET=changeme\nNORMAL=hello\n');
    const result = runAudit(p);
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('summary');
    expect(result.summary).toHaveProperty('total');
    const codes = result.issues.map(i => i.code);
    expect(codes).toContain('WEAK_SECRET');
    fs.unlinkSync(p);
  });

  test('throws if file does not exist', () => {
    expect(() => runAudit('/no/such/file.env')).toThrow('File not found');
  });

  test('returns clean summary for a good env file', () => {
    const p = writeTmp('APP_NAME=myapp\nPORT=3000\nDATABASE_URL=postgres://localhost/db\n');
    const result = runAudit(p);
    expect(result.summary.counts.error || 0).toBe(0);
    fs.unlinkSync(p);
  });
});
