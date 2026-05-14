const { resolveConflict, squashEnvs, findSquashConflicts, buildSquashSummary } = require('./squasher');

describe('resolveConflict', () => {
  test('returns single value when no conflict', () => {
    expect(resolveConflict('K', ['v1', 'v1'], 'last')).toBe('v1');
  });

  test('strategy last picks last value', () => {
    expect(resolveConflict('K', ['a', 'b', 'c'], 'last')).toBe('c');
  });

  test('strategy first picks first value', () => {
    expect(resolveConflict('K', ['a', 'b'], 'first')).toBe('a');
  });

  test('strategy error throws on conflict', () => {
    expect(() => resolveConflict('K', ['a', 'b'], 'error')).toThrow(/Conflict on key/);
  });

  test('strategy error does not throw when no conflict', () => {
    expect(resolveConflict('K', ['same', 'same'], 'error')).toBe('same');
  });
});

describe('squashEnvs', () => {
  const e1 = { A: '1', B: 'hello' };
  const e2 = { B: 'world', C: '3' };
  const e3 = { A: '99' };

  test('merges all keys', () => {
    const r = squashEnvs([e1, e2], 'last');
    expect(Object.keys(r).sort()).toEqual(['A', 'B', 'C']);
  });

  test('last strategy wins for conflicts', () => {
    expect(squashEnvs([e1, e2], 'last').B).toBe('world');
  });

  test('first strategy wins for conflicts', () => {
    expect(squashEnvs([e1, e2], 'first').B).toBe('hello');
  });

  test('non-conflicting keys pass through', () => {
    expect(squashEnvs([e1, e2], 'last').C).toBe('3');
  });

  test('error strategy throws on conflict', () => {
    expect(() => squashEnvs([e1, e3], 'error')).toThrow();
  });

  test('single env returns copy', () => {
    expect(squashEnvs([e1], 'last')).toEqual(e1);
  });
});

describe('findSquashConflicts', () => {
  test('finds conflicting keys', () => {
    const conflicts = findSquashConflicts([{ A: '1', B: 'x' }, { A: '2', B: 'x' }]);
    expect(conflicts).toEqual(['A']);
  });

  test('returns empty when no conflicts', () => {
    expect(findSquashConflicts([{ A: '1' }, { B: '2' }])).toEqual([]);
  });
});

describe('buildSquashSummary', () => {
  test('reports correct counts', () => {
    const envs = [{ A: '1', B: 'x' }, { A: '2', C: '3' }];
    const result = squashEnvs(envs, 'last');
    const s = buildSquashSummary(envs, result, 'last');
    expect(s.inputCount).toBe(2);
    expect(s.outputKeys).toBe(3);
    expect(s.conflictCount).toBe(1);
    expect(s.conflictKeys).toContain('A');
    expect(s.strategy).toBe('last');
  });
});
