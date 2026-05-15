const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatScopeDiff, runScopeDiff } = require('./scope-runner');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envdiff-scope-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('formatScopeDiff', () => {
  it('shows in sync for matching scope', () => {
    const result = { scope: 'DB', only_a: [], only_b: [], diff: [], shared: ['DB_HOST'] };
    expect(formatScopeDiff(result)).toContain('in sync');
  });

  it('shows only_a keys', () => {
    const result = { scope: 'APP', only_a: ['APP_SECRET'], only_b: [], diff: [], shared: [] };
    expect(formatScopeDiff(result)).toContain('APP_SECRET');
    expect(formatScopeDiff(result)).toContain('only in A');
  });

  it('shows value mismatch keys', () => {
    const result = { scope: 'DB', only_a: [], only_b: [], diff: ['DB_HOST'], shared: ['DB_HOST'] };
    expect(formatScopeDiff(result)).toContain('DB_HOST');
    expect(formatScopeDiff(result)).toContain('mismatch');
  });

  it('includes scope label', () => {
    const result = { scope: 'REDIS', only_a: [], only_b: [], diff: [], shared: [] };
    expect(formatScopeDiff(result)).toContain('[REDIS]');
  });
});

describe('runScopeDiff', () => {
  it('compares all scopes when no scope given', () => {
    const a = writeTmp('DB_HOST=localhost\nAPP_NAME=foo\n');
    const b = writeTmp('DB_HOST=remotehost\nAPP_NAME=foo\n');
    const out = runScopeDiff(a, b);
    expect(out).toContain('[APP]');
    expect(out).toContain('[DB]');
  });

  it('limits output to a single scope', () => {
    const a = writeTmp('DB_HOST=localhost\nAPP_NAME=foo\n');
    const b = writeTmp('DB_HOST=localhost\nAPP_NAME=bar\n');
    const out = runScopeDiff(a, b, 'APP');
    expect(out).toContain('[APP]');
    expect(out).not.toContain('[DB]');
  });

  it('returns message when no scoped keys exist', () => {
    const a = writeTmp('PLAIN=1\n');
    const b = writeTmp('PLAIN=2\n');
    const out = runScopeDiff(a, b);
    expect(out).toContain('No scoped keys');
  });
});
