const { pinEnv, checkPins, isPinClean, buildPinSummary } = require('./pinner');

describe('pinEnv', () => {
  it('wraps each value in a pinned object', () => {
    const result = pinEnv({ FOO: 'bar', BAZ: '123' });
    expect(result).toEqual({ FOO: { pinned: 'bar' }, BAZ: { pinned: '123' } });
  });

  it('returns empty object for empty input', () => {
    expect(pinEnv({})).toEqual({});
  });
});

describe('checkPins', () => {
  const pinMap = { FOO: { pinned: 'bar' }, BAZ: { pinned: '123' } };

  it('marks matching keys as match', () => {
    const results = checkPins(pinMap, { FOO: 'bar', BAZ: '123' });
    expect(results.every(r => r.status === 'match')).toBe(true);
  });

  it('marks changed keys', () => {
    const results = checkPins(pinMap, { FOO: 'NEW', BAZ: '123' });
    const foo = results.find(r => r.key === 'FOO');
    expect(foo.status).toBe('changed');
    expect(foo.actual).toBe('NEW');
    expect(foo.pinned).toBe('bar');
  });

  it('marks missing keys', () => {
    const results = checkPins(pinMap, { BAZ: '123' });
    const foo = results.find(r => r.key === 'FOO');
    expect(foo.status).toBe('missing');
    expect(foo.actual).toBeUndefined();
  });

  it('marks added keys', () => {
    const results = checkPins(pinMap, { FOO: 'bar', BAZ: '123', EXTRA: 'yes' });
    const extra = results.find(r => r.key === 'EXTRA');
    expect(extra.status).toBe('added');
    expect(extra.pinned).toBeUndefined();
  });

  it('returns results sorted by key', () => {
    const results = checkPins({ Z: { pinned: '1' }, A: { pinned: '2' } }, { Z: '1', A: '2' });
    expect(results[0].key).toBe('A');
    expect(results[1].key).toBe('Z');
  });
});

describe('isPinClean', () => {
  it('returns true when all are match or added', () => {
    expect(isPinClean([{ status: 'match' }, { status: 'added' }])).toBe(true);
  });

  it('returns false when any changed or missing', () => {
    expect(isPinClean([{ status: 'match' }, { status: 'changed' }])).toBe(false);
    expect(isPinClean([{ status: 'missing' }])).toBe(false);
  });
});

describe('buildPinSummary', () => {
  it('counts statuses and sets clean flag', () => {
    const results = [
      { status: 'match' }, { status: 'match' },
      { status: 'changed' }, { status: 'missing' }, { status: 'added' }
    ];
    const summary = buildPinSummary(results);
    expect(summary.total).toBe(5);
    expect(summary.match).toBe(2);
    expect(summary.changed).toBe(1);
    expect(summary.missing).toBe(1);
    expect(summary.added).toBe(1);
    expect(summary.clean).toBe(false);
  });

  it('marks clean when only match and added', () => {
    const summary = buildPinSummary([{ status: 'match' }, { status: 'added' }]);
    expect(summary.clean).toBe(true);
  });
});
