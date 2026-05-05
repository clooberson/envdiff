const { mergeEnvs, mergeAll, hasConflicts } = require('./merger');

describe('mergeEnvs', () => {
  test('merges two non-overlapping envs', () => {
    const base = { A: '1', B: '2' };
    const override = { C: '3' };
    const { merged, conflicts } = mergeEnvs(base, override);
    expect(merged).toEqual({ A: '1', B: '2', C: '3' });
    expect(conflicts).toHaveLength(0);
  });

  test('override wins on conflict by default', () => {
    const base = { A: 'old' };
    const override = { A: 'new' };
    const { merged, conflicts } = mergeEnvs(base, override);
    expect(merged.A).toBe('new');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({ key: 'A', baseValue: 'old', overrideValue: 'new' });
  });

  test('strict mode keeps base value on conflict', () => {
    const base = { A: 'old' };
    const override = { A: 'new' };
    const { merged, conflicts } = mergeEnvs(base, override, { strict: true });
    expect(merged.A).toBe('old');
    expect(conflicts).toHaveLength(1);
  });

  test('identical values do not produce conflicts', () => {
    const base = { A: 'same' };
    const override = { A: 'same' };
    const { conflicts } = mergeEnvs(base, override);
    expect(conflicts).toHaveLength(0);
  });
});

describe('mergeAll', () => {
  test('returns empty merged for empty list', () => {
    const { merged, conflicts } = mergeAll([]);
    expect(merged).toEqual({});
    expect(conflicts).toHaveLength(0);
  });

  test('merges multiple envs in order', () => {
    const envs = [{ A: '1' }, { B: '2' }, { A: '3', C: '4' }];
    const { merged, conflicts } = mergeAll(envs);
    expect(merged).toEqual({ A: '3', B: '2', C: '4' });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].key).toBe('A');
  });

  test('accumulates conflicts across all merges', () => {
    const envs = [{ X: 'a' }, { X: 'b' }, { X: 'c' }];
    const { conflicts } = mergeAll(envs);
    expect(conflicts).toHaveLength(2);
  });
});

describe('hasConflicts', () => {
  test('returns true when conflicts exist', () => {
    expect(hasConflicts([{ key: 'A' }])).toBe(true);
  });

  test('returns false for empty array', () => {
    expect(hasConflicts([])).toBe(false);
  });

  test('returns false for non-array', () => {
    expect(hasConflicts(null)).toBe(false);
  });
});
