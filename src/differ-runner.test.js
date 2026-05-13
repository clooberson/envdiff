const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatDiffRow, formatDiffSummary, runDiffCommand } = require('./differ-runner');

function writeTmp(content) {
  const file = path.join(os.tmpdir(), `envdiff-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('formatDiffRow', () => {
  it('formats a missing row', () => {
    const row = { key: 'DB_HOST', status: 'missing', baseValue: 'localhost', compareValue: undefined };
    const result = formatDiffRow(row, true);
    expect(result).toContain('DB_HOST');
    expect(result).toContain('[MISSING]');
    expect(result).toContain('localhost');
  });

  it('formats a mismatch row', () => {
    const row = { key: 'PORT', status: 'mismatch', baseValue: '3000', compareValue: '4000' };
    const result = formatDiffRow(row, true);
    expect(result).toContain('PORT');
    expect(result).toContain('[MISMATCH]');
    expect(result).toContain('3000 → 4000');
  });

  it('formats an ok row', () => {
    const row = { key: 'NODE_ENV', status: 'ok', baseValue: 'production', compareValue: 'production' };
    const result = formatDiffRow(row, true);
    expect(result).toContain('NODE_ENV');
    expect(result).toContain('[OK]');
  });
});

describe('formatDiffSummary', () => {
  it('lists all statuses', () => {
    const summary = { ok: 2, missing: 1, mismatch: 1, extra: 0 };
    const result = formatDiffSummary(summary);
    expect(result).toContain('ok: 2');
    expect(result).toContain('missing: 1');
    expect(result).toContain('mismatch: 1');
  });
});

describe('runDiffCommand', () => {
  it('returns rows and summary for two env files', () => {
    const base = writeTmp('DB_HOST=localhost\nPORT=3000\nSECRET=abc');
    const compare = writeTmp('DB_HOST=localhost\nPORT=4000');
    const { rows, summary } = runDiffCommand(base, compare, { noColor: true, quiet: true });
    expect(Array.isArray(rows)).toBe(true);
    expect(typeof summary).toBe('object');
    const mismatched = rows.find(r => r.key === 'PORT');
    expect(mismatched.status).toBe('mismatch');
    const missing = rows.find(r => r.key === 'SECRET');
    expect(missing.status).toBe('missing');
  });

  it('returns zero mismatches for identical files', () => {
    const content = 'FOO=bar\nBAZ=qux';
    const a = writeTmp(content);
    const b = writeTmp(content);
    const { summary } = runDiffCommand(a, b, { quiet: true });
    expect(summary.mismatch).toBe(0);
    expect(summary.missing).toBe(0);
  });
});
