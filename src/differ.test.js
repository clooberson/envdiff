const { runDiff, flattenGrouped, buildSummary } = require('./differ');

const BASE = `
DB_HOST=localhost
DB_PORT=5432
API_KEY=secret
DEBUG=true
`.trim();

const TARGET = `
DB_HOST=prod.example.com
DB_PORT=5432
NEW_FLAG=1
`.trim();

describe('runDiff', () => {
  test('returns results array and summary', () => {
    const { results, summary } = runDiff(BASE, TARGET);
    expect(Array.isArray(results)).toBe(true);
    expect(summary).toHaveProperty('total');
    expect(summary.total).toBeGreaterThan(0);
  });

  test('detects missing keys in target', () => {
    const { results } = runDiff(BASE, TARGET);
    const missing = results.filter(r => r.status === 'missing');
    const keys = missing.map(r => r.key);
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('DEBUG');
  });

  test('detects mismatched values', () => {
    const { results } = runDiff(BASE, TARGET);
    const mismatched = results.filter(r => r.status === 'mismatch');
    expect(mismatched.some(r => r.key === 'DB_HOST')).toBe(true);
  });

  test('include filter limits keys', () => {
    const { results } = runDiff(BASE, TARGET, { include: ['DB_HOST'] });
    expect(results.length).toBe(1);
    expect(results[0].key).toBe('DB_HOST');
  });

  test('exclude filter removes keys', () => {
    const { results } = runDiff(BASE, TARGET, { exclude: ['DEBUG', 'API_KEY'] });
    const keys = results.map(r => r.key);
    expect(keys).not.toContain('DEBUG');
    expect(keys).not.toContain('API_KEY');
  });

  test('sorted option returns results without error', () => {
    const { results } = runDiff(BASE, TARGET, { sorted: true });
    expect(Array.isArray(results)).toBe(true);
  });

  test('summary counts match result array lengths', () => {
    const { results, summary } = runDiff(BASE, TARGET);
    expect(summary.total).toBe(results.length);
  });
});

describe('buildSummary', () => {
  test('aggregates counts from grouped results', () => {
    const grouped = {
      match: [{ key: 'A' }],
      mismatch: [{ key: 'B' }, { key: 'C' }],
      missing: [],
    };
    const summary = buildSummary(grouped);
    expect(summary.match).toBe(1);
    expect(summary.mismatch).toBe(2);
    expect(summary.missing).toBe(0);
    expect(summary.total).toBe(3);
  });
});
