const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatConflict, formatSquashSummary, runSquash } = require('./squash-runner');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envdiff-squash-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('formatConflict', () => {
  test('formats conflict line', () => {
    expect(formatConflict('MY_KEY')).toBe('  ! conflict: MY_KEY');
  });
});

describe('formatSquashSummary', () => {
  test('shows no conflicts message', () => {
    const s = { inputCount: 2, outputKeys: 3, conflictCount: 0, conflictKeys: [], strategy: 'last' };
    const r = formatSquashSummary(s);
    expect(r).toContain('No conflicts');
    expect(r).toContain('strategy: last');
  });

  test('lists conflict keys', () => {
    const s = { inputCount: 2, outputKeys: 2, conflictCount: 1, conflictKeys: ['DB_URL'], strategy: 'first' };
    const r = formatSquashSummary(s);
    expect(r).toContain('DB_URL');
    expect(r).toContain('Conflicts (1)');
  });
});

describe('runSquash', () => {
  test('squashes two files with last strategy', () => {
    const f1 = writeTmp('A=1\nB=hello\n');
    const f2 = writeTmp('B=world\nC=3\n');
    const { result, summary } = runSquash([f1, f2], { strategy: 'last' });
    expect(result.A).toBe('1');
    expect(result.B).toBe('world');
    expect(result.C).toBe('3');
    expect(summary.conflictCount).toBe(1);
  });

  test('squashes with first strategy', () => {
    const f1 = writeTmp('X=original\n');
    const f2 = writeTmp('X=override\n');
    const { result } = runSquash([f1, f2], { strategy: 'first' });
    expect(result.X).toBe('original');
  });

  test('writes output file when opt provided', () => {
    const f1 = writeTmp('Z=99\n');
    const out = path.join(os.tmpdir(), `squash-out-${Date.now()}.env`);
    runSquash([f1], { output: out });
    expect(fs.existsSync(out)).toBe(true);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('Z=99');
    fs.unlinkSync(out);
  });

  test('report string is non-empty', () => {
    const f1 = writeTmp('A=1\n');
    const { report } = runSquash([f1]);
    expect(typeof report).toBe('string');
    expect(report.length).toBeGreaterThan(0);
  });
});
