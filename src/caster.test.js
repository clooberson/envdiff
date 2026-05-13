const { castValue, castEnv, castDiff, buildCastSummary } = require('./caster');

describe('castValue', () => {
  it('casts "true" to boolean true', () => {
    expect(castValue('true')).toBe(true);
  });
  it('casts "FALSE" to boolean false', () => {
    expect(castValue('FALSE')).toBe(false);
  });
  it('casts "null" to null', () => {
    expect(castValue('null')).toBeNull();
  });
  it('casts "undefined" to undefined', () => {
    expect(castValue('undefined')).toBeUndefined();
  });
  it('casts numeric strings to numbers', () => {
    expect(castValue('42')).toBe(42);
    expect(castValue('3.14')).toBe(3.14);
  });
  it('leaves plain strings unchanged', () => {
    expect(castValue('hello')).toBe('hello');
  });
  it('leaves empty string unchanged', () => {
    expect(castValue('')).toBe('');
  });
});

describe('castEnv', () => {
  it('casts all values in an env object', () => {
    const env = { ENABLED: 'true', PORT: '3000', NAME: 'app', RETRIES: '0' };
    const result = castEnv(env);
    expect(result.ENABLED).toBe(true);
    expect(result.PORT).toBe(3000);
    expect(result.NAME).toBe('app');
    expect(result.RETRIES).toBe(0);
  });
});

describe('castDiff', () => {
  it('returns only keys whose value changed type', () => {
    const env = { FLAG: 'true', NAME: 'app', COUNT: '5' };
    const diff = castDiff(env);
    expect(diff).toHaveProperty('FLAG');
    expect(diff).toHaveProperty('COUNT');
    expect(diff).not.toHaveProperty('NAME');
  });
  it('records original and casted values', () => {
    const diff = castDiff({ PORT: '8080' });
    expect(diff.PORT.original).toBe('8080');
    expect(diff.PORT.casted).toBe(8080);
    expect(diff.PORT.changed).toBe(true);
  });
});

describe('buildCastSummary', () => {
  it('counts types correctly', () => {
    const env = { A: 'true', B: 'false', C: '42', D: 'null', E: 'hello' };
    const summary = buildCastSummary(env);
    expect(summary.boolean).toBe(2);
    expect(summary.number).toBe(1);
    expect(summary.null).toBe(1);
    expect(summary.unchanged).toBe(1);
  });
});
