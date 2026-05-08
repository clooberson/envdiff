const { maskValue, maskEnv, maskKeys, maskDiffRows } = require('./masker');

describe('maskValue', () => {
  test('masks a normal value with prefix and length hint', () => {
    expect(maskValue('supersecret')).toBe('sup…(11)');
  });

  test('fully masks short values', () => {
    expect(maskValue('ab')).toBe('****');
  });

  test('empty string returns as-is', () => {
    expect(maskValue('')).toBe('');
  });

  test('custom reveal length', () => {
    expect(maskValue('abcdefgh', { reveal: 5 })).toBe('abcde…(8)');
  });

  test('no hint shows mask suffix instead', () => {
    expect(maskValue('supersecret', { hint: false })).toBe('sup****');
  });

  test('non-string returns as-is', () => {
    expect(maskValue(undefined)).toBe(undefined);
  });
});

describe('maskEnv', () => {
  test('masks all values in env object', () => {
    const env = { API_KEY: 'abc123xyz', TOKEN: 'tok' };
    const result = maskEnv(env);
    expect(result.API_KEY).toBe('abc…(9)');
    expect(result.TOKEN).toBe('****');
  });

  test('preserves all keys', () => {
    const env = { A: 'hello', B: 'world' };
    expect(Object.keys(maskEnv(env))).toEqual(['A', 'B']);
  });
});

describe('maskKeys', () => {
  test('only masks specified keys', () => {
    const env = { API_KEY: 'secret123', PLAIN: 'visible' };
    const result = maskKeys(env, ['API_KEY']);
    expect(result.API_KEY).toBe('sec…(9)');
    expect(result.PLAIN).toBe('visible');
  });

  test('key matching is case-insensitive', () => {
    const env = { api_key: 'secret123' };
    const result = maskKeys(env, ['API_KEY']);
    expect(result.api_key).toBe('sec…(9)');
  });

  test('returns unchanged env if no keys match', () => {
    const env = { FOO: 'bar' };
    expect(maskKeys(env, ['NOPE'])).toEqual({ FOO: 'bar' });
  });
});

describe('maskDiffRows', () => {
  test('masks a and b values in diff rows', () => {
    const rows = [
      { key: 'SECRET', a: 'oldvalue', b: 'newvalue', status: 'changed' },
    ];
    const result = maskDiffRows(rows);
    expect(result[0].a).toBe('old…(8)');
    expect(result[0].b).toBe('new…(8)');
    expect(result[0].key).toBe('SECRET');
  });

  test('handles null a or b gracefully', () => {
    const rows = [{ key: 'X', a: null, b: 'added', status: 'added' }];
    const result = maskDiffRows(rows);
    expect(result[0].a).toBeNull();
    expect(result[0].b).toBe('add…(5)');
  });
});
