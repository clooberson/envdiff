const { compareEnvs, isClean } = require('./comparator');

describe('compareEnvs', () => {
  const envA = { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc123', SHARED: 'same' };
  const envB = { DB_HOST: 'prod.db', DB_PORT: '5432', API_KEY: 'xyz', SHARED: 'same' };

  let result;
  beforeEach(() => {
    result = compareEnvs(envA, envB);
  });

  test('detects keys missing in B', () => {
    expect(result.missingInB).toEqual(['SECRET']);
  });

  test('detects keys missing in A', () => {
    expect(result.missingInA).toEqual(['API_KEY']);
  });

  test('detects mismatched values', () => {
    expect(result.mismatched).toEqual([
      { key: 'DB_HOST', valueA: 'localhost', valueB: 'prod.db' },
    ]);
  });

  test('detects matching keys', () => {
    expect(result.matching).toContain('DB_PORT');
    expect(result.matching).toContain('SHARED');
  });

  test('ignoreValues option skips value comparison', () => {
    const r = compareEnvs(envA, envB, { ignoreValues: true });
    expect(r.mismatched).toEqual([]);
    expect(r.matching).toContain('DB_HOST');
  });

  test('identical envs produce clean diff', () => {
    const r = compareEnvs(envA, envA);
    expect(isClean(r)).toBe(true);
  });

  test('isClean returns false when there are issues', () => {
    expect(isClean(result)).toBe(false);
  });

  test('isClean returns false when only missingInA has entries', () => {
    const r = compareEnvs({}, { ONLY_B: '1' });
    expect(isClean(r)).toBe(false);
  });

  test('isClean returns false when only mismatched has entries', () => {
    const r = compareEnvs({ KEY: 'a' }, { KEY: 'b' });
    expect(isClean(r)).toBe(false);
  });

  test('empty envs produce clean diff', () => {
    const r = compareEnvs({}, {});
    expect(isClean(r)).toBe(true);
  });

  test('results are sorted alphabetically', () => {
    const a = { Z_KEY: '1', A_KEY: '2' };
    const b = { Z_KEY: '1' };
    const r = compareEnvs(a, b);
    expect(r.missingInB[0]).toBe('A_KEY');
  });
});
