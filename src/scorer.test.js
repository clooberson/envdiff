const { sharedKeyScore, valueMatchScore, missingCount, buildScore } = require('./scorer');

describe('sharedKeyScore', () => {
  test('identical keys → 100', () => {
    expect(sharedKeyScore({ A: '1', B: '2' }, { A: '1', B: '2' })).toBe(100);
  });

  test('no overlap → 0', () => {
    expect(sharedKeyScore({ A: '1' }, { B: '2' })).toBe(0);
  });

  test('partial overlap', () => {
    // union=3, intersection=1 → 33
    expect(sharedKeyScore({ A: '1', B: '2' }, { B: '2', C: '3' })).toBe(33);
  });

  test('both empty → 100', () => {
    expect(sharedKeyScore({}, {})).toBe(100);
  });
});

describe('valueMatchScore', () => {
  test('all values match → 100', () => {
    expect(valueMatchScore({ A: '1' }, { A: '1', B: '2' })).toBe(100);
  });

  test('no values match → 0', () => {
    expect(valueMatchScore({ A: '1' }, { A: '2' })).toBe(0);
  });

  test('no shared keys → 100', () => {
    expect(valueMatchScore({ A: '1' }, { B: '2' })).toBe(100);
  });

  test('mixed match', () => {
    // shared: A,B — A matches, B does not → 50
    expect(valueMatchScore({ A: '1', B: 'x' }, { A: '1', B: 'y' })).toBe(50);
  });
});

describe('missingCount', () => {
  test('nothing missing', () => {
    expect(missingCount({ A: '1' }, { A: '1', B: '2' })).toBe(0);
  });

  test('one missing', () => {
    expect(missingCount({ A: '1', B: '2' }, { A: '1' })).toBe(1);
  });
});

describe('buildScore', () => {
  test('returns expected shape', () => {
    const result = buildScore({ A: '1', B: '2' }, { A: '1', C: '3' }, 'dev', 'prod');
    expect(result).toHaveProperty('overall');
    expect(result).toHaveProperty('keyScore');
    expect(result).toHaveProperty('valueMatchScore');
    expect(result.labels).toEqual({ a: 'dev', b: 'prod' });
    expect(result.totalKeys).toBe(3);
  });

  test('perfect match scores 100 overall', () => {
    const env = { A: '1', B: '2' };
    const result = buildScore(env, { ...env });
    expect(result.overall).toBe(100);
  });
});
