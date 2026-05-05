const path = require('path');
const fs = require('fs');
const os = require('os');
const { runValidation, formatFailure, formatSummary } = require('./validate-runner');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envdiff-val-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('formatFailure', () => {
  test('formats a failure with a value', () => {
    const out = formatFailure({ key: 'PORT', rule: 'number', value: 'abc' });
    expect(out).toContain('PORT');
    expect(out).toContain('number');
    expect(out).toContain('abc');
  });

  test('shows (empty) for missing value', () => {
    const out = formatFailure({ key: 'PORT', rule: 'nonempty', value: '' });
    expect(out).toContain('(empty)');
  });
});

describe('formatSummary', () => {
  test('shows success message when no failures', () => {
    expect(formatSummary(5, 0)).toContain('passed');
  });

  test('shows failure count when failures exist', () => {
    const msg = formatSummary(5, 2);
    expect(msg).toContain('2 of 5');
    expect(msg).toContain('failed');
  });
});

describe('runValidation', () => {
  test('passes when all rules satisfied', () => {
    const tmp = writeTmp('PORT=3000\nDEBUG=true\n');
    const result = runValidation(tmp, { PORT: 'number', DEBUG: 'boolean' });
    expect(result.passed).toBe(true);
    expect(result.output).toContain('passed');
    fs.unlinkSync(tmp);
  });

  test('fails when a rule is violated', () => {
    const tmp = writeTmp('PORT=notanumber\n');
    const result = runValidation(tmp, { PORT: 'number' });
    expect(result.passed).toBe(false);
    expect(result.output).toContain('PORT');
    fs.unlinkSync(tmp);
  });

  test('handles missing file gracefully', () => {
    const result = runValidation('/nonexistent/.env', { PORT: 'number' });
    expect(result.passed).toBe(false);
    expect(result.output).toContain('Error loading file');
  });

  test('reports multiple failures', () => {
    const tmp = writeTmp('PORT=abc\nAPI_URL=bad-url\n');
    const result = runValidation(tmp, { PORT: 'number', API_URL: 'url' });
    expect(result.passed).toBe(false);
    expect(result.output).toContain('PORT');
    expect(result.output).toContain('API_URL');
    fs.unlinkSync(tmp);
  });
});
