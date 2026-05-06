const { resolveValue, resolveEnv, findUnresolved, resolveWithContext } = require('./resolver');

describe('resolveValue', () => {
  test('returns plain value unchanged', () => {
    expect(resolveValue('hello', {})).toBe('hello');
  });

  test('replaces known reference', () => {
    expect(resolveValue('${HOST}:3000', { HOST: 'localhost' })).toBe('localhost:3000');
  });

  test('leaves unknown reference intact', () => {
    expect(resolveValue('${UNKNOWN}', {})).toBe('${UNKNOWN}');
  });

  test('handles multiple references', () => {
    const env = { PROTO: 'https', HOST: 'example.com' };
    expect(resolveValue('${PROTO}://${HOST}', env)).toBe('https://example.com');
  });

  test('returns non-string values as-is', () => {
    expect(resolveValue(undefined, {})).toBeUndefined();
  });
});

describe('resolveEnv', () => {
  test('resolves self-referencing keys', () => {
    const env = { BASE: '/app', DATA: '${BASE}/data' };
    const result = resolveEnv(env);
    expect(result.DATA).toBe('/app/data');
    expect(result.BASE).toBe('/app');
  });

  test('leaves unresolvable references intact', () => {
    const env = { URL: '${MISSING}/path' };
    const result = resolveEnv(env);
    expect(result.URL).toBe('${MISSING}/path');
  });

  test('returns empty object for empty input', () => {
    expect(resolveEnv({})).toEqual({});
  });
});

describe('findUnresolved', () => {
  test('returns keys with unresolved references', () => {
    const env = { A: '${NOPE}', B: 'ok' };
    expect(findUnresolved(env)).toEqual(['A']);
  });

  test('returns empty array when all resolved', () => {
    const env = { HOST: 'localhost', URL: '${HOST}/api' };
    expect(findUnresolved(env)).toEqual([]);
  });
});

describe('resolveWithContext', () => {
  test('uses context to resolve references not in env', () => {
    const env = { URL: '${HOST}/path' };
    const context = { HOST: 'ctx-host' };
    const result = resolveWithContext(env, context);
    expect(result.URL).toBe('ctx-host/path');
  });

  test('env values take priority over context', () => {
    const env = { HOST: 'env-host', URL: '${HOST}/path' };
    const context = { HOST: 'ctx-host' };
    const result = resolveWithContext(env, context);
    expect(result.URL).toBe('env-host/path');
  });

  test('works with no context provided', () => {
    const env = { A: 'plain' };
    expect(resolveWithContext(env)).toEqual({ A: 'plain' });
  });
});
