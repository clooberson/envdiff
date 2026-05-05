'use strict';

const { formatTable, formatAnnotations } = require('./formatter');

const cleanResult = { missing: [], mismatched: [], extra: [] };
const dirtyResult = {
  missing: ['DB_HOST', 'DB_PORT'],
  mismatched: [{ key: 'APP_ENV', baseValue: 'production', compareValue: 'staging' }],
  extra: ['DEBUG_MODE'],
};

describe('formatTable', () => {
  test('returns clean message when no differences', () => {
    const out = formatTable(cleanResult);
    expect(out).toContain('No differences found');
  });

  test('lists missing keys', () => {
    const out = formatTable(dirtyResult);
    expect(out).toContain('DB_HOST');
    expect(out).toContain('DB_PORT');
    expect(out).toContain('Missing keys (2)');
  });

  test('lists mismatched keys with values', () => {
    const out = formatTable(dirtyResult);
    expect(out).toContain('APP_ENV');
    expect(out).toContain('production');
    expect(out).toContain('staging');
  });

  test('lists extra keys', () => {
    const out = formatTable(dirtyResult);
    expect(out).toContain('DEBUG_MODE');
    expect(out).toContain('Extra keys in compare');
  });

  test('includes label when provided', () => {
    const out = formatTable(cleanResult, { label: 'staging.env' });
    expect(out).toContain('staging.env');
  });

  test('handles missing extra field gracefully', () => {
    const out = formatTable({ missing: ['X'], mismatched: [] });
    expect(out).toContain('X');
  });
});

describe('formatAnnotations', () => {
  test('emits warning annotations for missing keys', () => {
    const out = formatAnnotations(dirtyResult);
    expect(out).toContain('::warning::Missing key: DB_HOST');
    expect(out).toContain('::warning::Missing key: DB_PORT');
  });

  test('emits warning annotations for mismatched keys', () => {
    const out = formatAnnotations(dirtyResult);
    expect(out).toContain('::warning::Mismatched value for key: APP_ENV');
  });

  test('returns empty string when clean', () => {
    const out = formatAnnotations(cleanResult);
    expect(out).toBe('');
  });
});
