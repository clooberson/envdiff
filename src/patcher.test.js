const { applyPatch, serializeEnv, patchSummary } = require('./patcher');

describe('applyPatch', () => {
  const base = { HOST: 'localhost', PORT: '3000' };
  const source = { HOST: 'prod.example.com', PORT: '8080', DB: 'postgres' };

  it('adds missing keys from source', () => {
    const diff = { missingInBase: ['DB'], mismatched: [] };
    const result = applyPatch(base, diff, source);
    expect(result.DB).toBe('postgres');
  });

  it('overwrites mismatched keys with source values', () => {
    const diff = { missingInBase: [], mismatched: ['HOST'] };
    const result = applyPatch(base, diff, source);
    expect(result.HOST).toBe('prod.example.com');
  });

  it('preserves keys not in diff', () => {
    const diff = { missingInBase: ['DB'], mismatched: ['HOST'] };
    const result = applyPatch(base, diff, source);
    expect(result.PORT).toBe('3000');
  });

  it('handles empty diff gracefully', () => {
    const diff = {};
    const result = applyPatch(base, diff, source);
    expect(result).toEqual(base);
  });

  it('skips keys missing in source', () => {
    const diff = { missingInBase: ['UNKNOWN'], mismatched: [] };
    const result = applyPatch(base, diff, source);
    expect(result.UNKNOWN).toBeUndefined();
  });
});

describe('serializeEnv', () => {
  it('serializes key=value pairs', () => {
    const out = serializeEnv({ FOO: 'bar', BAZ: 'qux' });
    expect(out).toContain('FOO=bar');
    expect(out).toContain('BAZ=qux');
  });

  it('quotes values with spaces', () => {
    const out = serializeEnv({ NAME: 'hello world' });
    expect(out).toContain('NAME="hello world"');
  });

  it('quotes values with hash', () => {
    const out = serializeEnv({ TAG: 'v1#rc1' });
    expect(out).toContain('TAG="v1#rc1"');
  });

  it('ends with newline', () => {
    const out = serializeEnv({ A: '1' });
    expect(out.endsWith('\n')).toBe(true);
  });
});

describe('patchSummary', () => {
  it('counts added and updated', () => {
    const diff = { missingInBase: ['A', 'B'], mismatched: ['C'] };
    const s = patchSummary(diff);
    expect(s.added).toBe(2);
    expect(s.updated).toBe(1);
    expect(s.total).toBe(3);
  });

  it('handles empty diff', () => {
    const s = patchSummary({});
    expect(s.total).toBe(0);
  });
});
