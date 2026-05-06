const { lintKey, lintValue, lintEnv, isCleanLint } = require('./linter');

describe('lintKey', () => {
  test('accepts valid UPPER_SNAKE_CASE keys', () => {
    expect(lintKey('DATABASE_URL')).toBeNull();
    expect(lintKey('PORT')).toBeNull();
    expect(lintKey('MY_KEY_123')).toBeNull();
  });

  test('rejects lowercase keys', () => {
    expect(lintKey('database_url')).toMatch(/UPPER_SNAKE_CASE/);
  });

  test('rejects keys starting with a digit', () => {
    expect(lintKey('1_KEY')).toMatch(/UPPER_SNAKE_CASE/);
  });

  test('rejects empty key', () => {
    expect(lintKey('')).toBe('empty key');
  });
});

describe('lintValue', () => {
  test('returns null for clean value', () => {
    expect(lintValue('KEY', 'somevalue')).toBeNull();
  });

  test('flags leading whitespace', () => {
    expect(lintValue('KEY', ' value')).toMatch(/whitespace/);
  });

  test('flags trailing whitespace', () => {
    expect(lintValue('KEY', 'value ')).toMatch(/whitespace/);
  });

  test('flags unquoted value with hash', () => {
    expect(lintValue('KEY', 'val#comment')).toMatch(/not quoted/);
  });

  test('allows quoted value with hash', () => {
    expect(lintValue('KEY', '"val#comment"')).toBeNull();
  });
});

describe('lintEnv', () => {
  test('returns empty array for clean env', () => {
    const env = { DATABASE_URL: 'postgres://localhost', PORT: '5432' };
    expect(lintEnv(env)).toEqual([]);
  });

  test('collects multiple issues', () => {
    const env = { bad_key: ' spaced ', GOOD_KEY: 'ok' };
    const issues = lintEnv(env);
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('isCleanLint', () => {
  test('true when no issues', () => {
    expect(isCleanLint([])).toBe(true);
  });

  test('false when issues exist', () => {
    expect(isCleanLint([{ key: 'X', issue: 'something' }])).toBe(false);
  });
});
