const { findDuplicateLines, duplicateKeys, dedupeEnv, buildDedupeSummary } = require('./deduper');

describe('findDuplicateLines', () => {
  it('returns empty object when no duplicates', () => {
    const raw = 'FOO=1\nBAR=2\nBAZ=3';
    expect(findDuplicateLines(raw)).toEqual({});
  });

  it('detects a single duplicated key', () => {
    const raw = 'FOO=1\nBAR=2\nFOO=3';
    const result = findDuplicateLines(raw);
    expect(result).toHaveProperty('FOO');
    expect(result.FOO).toEqual([1, 3]);
  });

  it('ignores comment lines', () => {
    const raw = '# FOO=comment\nFOO=1\nFOO=2';
    const result = findDuplicateLines(raw);
    expect(result.FOO).toEqual([2, 3]);
  });

  it('ignores blank lines', () => {
    const raw = 'FOO=1\n\nFOO=2';
    expect(findDuplicateLines(raw).FOO).toEqual([1, 3]);
  });

  it('handles multiple duplicate keys', () => {
    const raw = 'A=1\nB=2\nA=3\nB=4';
    const result = findDuplicateLines(raw);
    expect(result.A).toEqual([1, 3]);
    expect(result.B).toEqual([2, 4]);
  });
});

describe('duplicateKeys', () => {
  it('returns keys present in both env and dupMap', () => {
    const env = { FOO: '3', BAR: '2' };
    const dupMap = { FOO: [1, 3] };
    expect(duplicateKeys(env, dupMap)).toEqual(['FOO']);
  });

  it('returns empty array when no overlap', () => {
    expect(duplicateKeys({ BAR: '1' }, { FOO: [1, 2] })).toEqual([]);
  });
});

describe('dedupeEnv', () => {
  const multi = { FOO: ['first', 'middle', 'last'], BAR: ['only'] };

  it('keeps last value by default', () => {
    expect(dedupeEnv(multi).FOO).toBe('last');
  });

  it('keeps first value when strategy is first', () => {
    expect(dedupeEnv(multi, 'first').FOO).toBe('first');
  });

  it('preserves non-duplicate keys', () => {
    expect(dedupeEnv(multi).BAR).toBe('only');
  });
});

describe('buildDedupeSummary', () => {
  it('builds correct summary', () => {
    const dupMap = { FOO: [1, 3], BAR: [2, 4] };
    const summary = buildDedupeSummary(dupMap);
    expect(summary.totalKeys).toBe(2);
    expect(summary.duplicateKeys).toContain('FOO');
    expect(summary.details).toEqual(dupMap);
  });

  it('returns zero total for empty dupMap', () => {
    expect(buildDedupeSummary({}).totalKeys).toBe(0);
  });
});
