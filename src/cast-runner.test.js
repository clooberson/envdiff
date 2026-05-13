const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatCastDiff, formatCastSummary, runCast } = require('./cast-runner');

function writeTmp(content) {
  const filePath = path.join(os.tmpdir(), `envdiff-cast-${Date.now()}.env`);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

describe('formatCastDiff', () => {
  it('formats a cast diff entry', () => {
    const diff = { PORT: { original: '3000', casted: 3000, changed: true } };
    const out = formatCastDiff(diff);
    expect(out).toContain('PORT');
    expect(out).toContain('"3000"');
    expect(out).toContain('number');
  });

  it('handles null casted value', () => {
    const diff = { EMPTY: { original: 'null', casted: null, changed: true } };
    const out = formatCastDiff(diff);
    expect(out).toContain('null');
  });
});

describe('formatCastSummary', () => {
  it('lists only non-zero counts', () => {
    const summary = { boolean: 2, number: 1, null: 0, undefined: 0, unchanged: 3 };
    const out = formatCastSummary(summary);
    expect(out).toContain('2 boolean');
    expect(out).toContain('1 number');
    expect(out).toContain('3 unchanged');
    expect(out).not.toContain('null');
  });
});

describe('runCast', () => {
  it('reports cast values in a real file', () => {
    const file = writeTmp('ENABLED=true\nPORT=8080\nNAME=myapp\n');
    const out = runCast(file);
    expect(out).toContain('File:');
    expect(out).toContain('ENABLED');
    expect(out).toContain('PORT');
    expect(out).toContain('Cast summary');
    fs.unlinkSync(file);
  });

  it('reports no casts when all values are plain strings', () => {
    const file = writeTmp('APP=myapp\nENV=production\n');
    const out = runCast(file);
    expect(out).toContain('No values would be cast');
    fs.unlinkSync(file);
  });
});
