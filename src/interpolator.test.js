const { interpolateValue, interpolateEnv, findUnresolvedRefs } = require('./interpolator');

describe('interpolateValue', () => {
  test('replaces ${VAR} style references', () => {
    expect(interpolateValue('hello_${NAME}', { NAME: 'world' })).toBe('hello_world');
  });

  test('replaces $VAR style references', () => {
    expect(interpolateValue('$HOST:8080', { HOST: 'localhost' })).toBe('localhost:8080');
  });

  test('replaces multiple references', () => {
    const ctx = { PROTO: 'https', HOST: 'example.com', PORT: '443' };
    expect(interpolateValue('${PROTO}://${HOST}:${PORT}', ctx)).toBe('https://example.com:443');
  });

  test('returns empty string for missing keys', () => {
    expect(interpolateValue('${MISSING}', {})).toBe('');
  });

  test('returns value unchanged when no references', () => {
    expect(interpolateValue('plain_value', {})).toBe('plain_value');
  });

  test('handles non-string value gracefully', () => {
    expect(interpolateValue(42, {})).toBe(42);
  });
});

describe('interpolateEnv', () => {
  test('expands all values using the same env as context', () => {
    const env = { BASE: '/app', LOG: '${BASE}/logs', DATA: '${BASE}/data' };
    const result = interpolateEnv(env);
    expect(result.LOG).toBe('/app/logs');
    expect(result.DATA).toBe('/app/data');
    expect(result.BASE).toBe('/app');
  });

  test('returns empty string for unresolvable refs', () => {
    const env = { FOO: '${UNDEFINED}_bar' };
    expect(interpolateEnv(env).FOO).toBe('_bar');
  });
});

describe('findUnresolvedRefs', () => {
  test('detects missing referenced keys', () => {
    const env = { URL: '${PROTO}://example.com' };
    const result = findUnresolvedRefs(env);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('URL');
    expect(result[0].refs).toContain('PROTO');
  });

  test('returns empty array when all refs are defined', () => {
    const env = { HOST: 'localhost', URL: '${HOST}:3000' };
    expect(findUnresolvedRefs(env)).toHaveLength(0);
  });

  test('returns empty array for env with no references', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(findUnresolvedRefs(env)).toHaveLength(0);
  });
});
