const { filterByKeys, filterExcludeKeys, buildMatcher } = require('./filter');

const sampleDiff = {
  missing: ['DB_HOST', 'API_KEY', 'PORT'],
  extra: ['DEBUG', 'LEGACY_MODE'],
  mismatched: [
    { key: 'NODE_ENV', base: 'development', compare: 'production' },
    { key: 'DB_PORT', base: '5432', compare: '3306' },
  ],
};

describe('buildMatcher', () => {
  it('matches keys from an array', () => {
    const match = buildMatcher(['DB_HOST', 'PORT']);
    expect(match('DB_HOST')).toBe(true);
    expect(match('API_KEY')).toBe(false);
  });

  it('matches keys using a RegExp', () => {
    const match = buildMatcher(/^DB_/);
    expect(match('DB_HOST')).toBe(true);
    expect(match('API_KEY')).toBe(false);
  });

  it('throws on invalid input', () => {
    expect(() => buildMatcher('bad')).toThrow(TypeError);
  });
});

describe('filterByKeys', () => {
  it('returns only matching keys', () => {
    const result = filterByKeys(sampleDiff, ['DB_HOST', 'DB_PORT', 'DEBUG']);
    expect(result.missing).toEqual(['DB_HOST']);
    expect(result.extra).toEqual(['DEBUG']);
    expect(result.mismatched).toEqual([
      { key: 'DB_PORT', base: '5432', compare: '3306' },
    ]);
  });

  it('returns full diff when include is empty', () => {
    const result = filterByKeys(sampleDiff, []);
    expect(result).toEqual(sampleDiff);
  });

  it('supports RegExp include', () => {
    const result = filterByKeys(sampleDiff, /^DB_/);
    expect(result.missing).toEqual(['DB_HOST']);
    expect(result.mismatched[0].key).toBe('DB_PORT');
  });
});

describe('filterExcludeKeys', () => {
  it('removes matching keys', () => {
    const result = filterExcludeKeys(sampleDiff, ['DB_HOST', 'DEBUG', 'NODE_ENV']);
    expect(result.missing).not.toContain('DB_HOST');
    expect(result.extra).not.toContain('DEBUG');
    expect(result.mismatched.map((e) => e.key)).not.toContain('NODE_ENV');
  });

  it('returns full diff when exclude is empty', () => {
    const result = filterExcludeKeys(sampleDiff, []);
    expect(result).toEqual(sampleDiff);
  });

  it('supports RegExp exclude', () => {
    const result = filterExcludeKeys(sampleDiff, /^DB_/);
    expect(result.missing).not.toContain('DB_HOST');
    expect(result.mismatched.map((e) => e.key)).not.toContain('DB_PORT');
  });
});
