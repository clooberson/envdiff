'use strict';

const {
  normalizeKey,
  normalizeValue,
  normalizeEnv,
  normalizeAll,
  buildNormalizeSummary,
} = require('./normalizer');

describe('normalizeKey', () => {
  test('uppercases a lowercase key', () => {
    expect(normalizeKey('api_key')).toBe('API_KEY');
  });

  test('trims whitespace from key', () => {
    expect(normalizeKey('  DB_HOST  ')).toBe('DB_HOST');
  });

  test('handles already uppercase key', () => {
    expect(normalizeKey('PORT')).toBe('PORT');
  });

  test('returns non-string as-is', () => {
    expect(normalizeKey(null)).toBe(null);
  });
});

describe('normalizeValue', () => {
  test('trims whitespace', () => {
    expect(normalizeValue('  hello  ')).toBe('hello');
  });

  test('normalizes truthy booleans', () => {
    expect(normalizeValue('yes')).toBe('true');
    expect(normalizeValue('1')).toBe('true');
    expect(normalizeValue('on')).toBe('true');
    expect(normalizeValue('TRUE')).toBe('true');
  });

  test('normalizes falsy booleans', () => {
    expect(normalizeValue('no')).toBe('false');
    expect(normalizeValue('0')).toBe('false');
    expect(normalizeValue('off')).toBe('false');
    expect(normalizeValue('FALSE')).toBe('false');
  });

  test('normalizes numeric strings with leading zeros', () => {
    expect(normalizeValue('007')).toBe('7');
    expect(normalizeValue('-042')).toBe('-42');
  });

  test('leaves plain strings untouched', () => {
    expect(normalizeValue('localhost')).toBe('localhost');
  });
});

describe('normalizeEnv', () => {
  test('normalizes keys and values in an env object', () => {
    const env = { api_key: '  secret  ', debug: 'yes', port: '08080' };
    const result = normalizeEnv(env);
    expect(result).toEqual({ API_KEY: 'secret', DEBUG: 'true', PORT: '8080' });
  });

  test('returns empty object for empty input', () => {
    expect(normalizeEnv({})).toEqual({});
  });
});

describe('normalizeAll', () => {
  test('normalizes multiple named envs', () => {
    const envMap = {
      dev: { db_host: 'localhost' },
      prod: { db_host: '  db.prod.example.com  ' },
    };
    const result = normalizeAll(envMap);
    expect(result.dev.DB_HOST).toBe('localhost');
    expect(result.prod.DB_HOST).toBe('db.prod.example.com');
  });
});

describe('buildNormalizeSummary', () => {
  test('reports key and value changes', () => {
    const original = { api_key: '  mySecret  ', enabled: 'yes' };
    const normalized = normalizeEnv(original);
    const summary = buildNormalizeSummary(original, normalized);
    expect(summary.keyChanges).toContain('api_key → API_KEY');
    expect(summary.keyChanges).toContain('enabled → ENABLED');
    expect(summary.valueChanges.some(v => v.includes('mySecret'))).toBe(true);
    expect(summary.valueChanges.some(v => v.includes('true'))).toBe(true);
  });

  test('returns empty arrays when nothing changes', () => {
    const env = { HOST: 'localhost' };
    const summary = buildNormalizeSummary(env, normalizeEnv(env));
    expect(summary.keyChanges).toHaveLength(0);
    expect(summary.valueChanges).toHaveLength(0);
  });
});
