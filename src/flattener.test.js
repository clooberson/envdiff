const { flattenObject, toEnvKeys, flattenToEnv, buildFlattenSummary } = require('./flattener');

describe('flattenObject', () => {
  test('flattens a simple nested object', () => {
    const input = { db: { host: 'localhost', port: 5432 } };
    expect(flattenObject(input)).toEqual({
      'db.host': 'localhost',
      'db.port': '5432',
    });
  });

  test('handles deeply nested keys', () => {
    const input = { a: { b: { c: 'deep' } } };
    expect(flattenObject(input)).toEqual({ 'a.b.c': 'deep' });
  });

  test('leaves flat objects unchanged in structure', () => {
    const input = { KEY: 'value', OTHER: '123' };
    expect(flattenObject(input)).toEqual({ KEY: 'value', OTHER: '123' });
  });

  test('converts arrays to comma-joined strings', () => {
    const input = { tags: ['a', 'b', 'c'] };
    expect(flattenObject(input)).toEqual({ tags: 'a,b,c' });
  });

  test('handles null values as empty string', () => {
    const input = { key: null };
    expect(flattenObject(input)).toEqual({ key: '' });
  });
});

describe('toEnvKeys', () => {
  test('converts dot-notation to SCREAMING_SNAKE_CASE', () => {
    const input = { 'db.host': 'localhost', 'db.port': '5432' };
    expect(toEnvKeys(input)).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  test('replaces hyphens with underscores', () => {
    const input = { 'my-key': 'val' };
    expect(toEnvKeys(input)).toEqual({ MY_KEY: 'val' });
  });
});

describe('flattenToEnv', () => {
  test('full pipeline flattens and converts keys', () => {
    const input = { server: { host: 'example.com', port: 8080 } };
    expect(flattenToEnv(input)).toEqual({
      SERVER_HOST: 'example.com',
      SERVER_PORT: '8080',
    });
  });

  test('handles mixed depth object', () => {
    const input = { app: { name: 'envdiff' }, version: '1.0' };
    const result = flattenToEnv(input);
    expect(result).toEqual({ APP_NAME: 'envdiff', VERSION: '1.0' });
  });
});

describe('buildFlattenSummary', () => {
  test('reports correct counts', () => {
    const original = { a: { b: 1 }, c: 2 };
    const flattened = { A_B: '1', C: '2' };
    const summary = buildFlattenSummary(original, flattened);
    expect(summary.originalKeys).toBe(2);
    expect(summary.flattenedKeys).toBe(2);
    expect(summary.expanded).toBe(0);
  });

  test('expanded is positive when nesting adds keys', () => {
    const original = { a: { b: 1, c: 2 } };
    const flattened = { A_B: '1', A_C: '2' };
    const summary = buildFlattenSummary(original, flattened);
    expect(summary.expanded).toBe(1);
  });
});
