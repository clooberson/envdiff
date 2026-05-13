const { trimValue, normalizeQuotes, trimEnv, normalizeEnv, buildTrimSummary } = require('./trimmer');

describe('trimValue', () => {
  it('trims leading and trailing whitespace', () => {
    expect(trimValue('  hello  ')).toBe('hello');
  });

  it('returns non-string values as-is', () => {
    expect(trimValue(undefined)).toBeUndefined();
    expect(trimValue(null)).toBeNull();
  });

  it('handles empty string', () => {
    expect(trimValue('')).toBe('');
  });
});

describe('normalizeQuotes', () => {
  it('removes surrounding double quotes', () => {
    expect(normalizeQuotes('"hello world"')).toBe('hello world');
  });

  it('removes surrounding single quotes', () => {
    expect(normalizeQuotes("'hello world'")).toBe('hello world');
  });

  it('does not remove mismatched quotes', () => {
    expect(normalizeQuotes('"hello world\'')).toBe('"hello world\'');
  });

  it('leaves unquoted values alone', () => {
    expect(normalizeQuotes('hello')).toBe('hello');
  });

  it('trims whitespace before checking quotes', () => {
    expect(normalizeQuotes('  "hello"  ')).toBe('hello');
  });
});

describe('trimEnv', () => {
  it('trims all values in env object', () => {
    const env = { A: '  foo  ', B: 'bar', C: '  ' };
    expect(trimEnv(env)).toEqual({ A: 'foo', B: 'bar', C: '' });
  });

  it('returns empty object for empty input', () => {
    expect(trimEnv({})).toEqual({});
  });
});

describe('normalizeEnv', () => {
  it('normalizes quotes for all values', () => {
    const env = { A: '"quoted"', B: "'also quoted'", C: 'plain' };
    expect(normalizeEnv(env)).toEqual({ A: 'quoted', B: 'also quoted', C: 'plain' });
  });
});

describe('buildTrimSummary', () => {
  it('identifies changed and unchanged keys', () => {
    const original = { A: '  foo  ', B: 'bar', C: '"baz"' };
    const cleaned = { A: 'foo', B: 'bar', C: '"baz"' };
    const summary = buildTrimSummary(original, cleaned);
    expect(summary.changed).toEqual(['A']);
    expect(summary.unchanged).toEqual(['B', 'C']);
  });

  it('returns all unchanged when nothing changed', () => {
    const env = { X: 'a', Y: 'b' };
    const summary = buildTrimSummary(env, { ...env });
    expect(summary.changed).toHaveLength(0);
    expect(summary.unchanged).toHaveLength(2);
  });
});
