const { stringifyEnv, mergeToString, roundTrip, annotatedString } = require('./stringer');
const { parseEnv } = require('./parser');

describe('stringifyEnv', () => {
  test('basic key=value pairs', () => {
    const result = stringifyEnv({ FOO: 'bar', BAZ: '123' });
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=123');
  });

  test('quotes values containing spaces', () => {
    const result = stringifyEnv({ MSG: 'hello world' });
    expect(result).toContain('MSG="hello world"');
  });

  test('quotes empty string values', () => {
    const result = stringifyEnv({ EMPTY: '' });
    expect(result).toContain('EMPTY=""');
  });

  test('null/undefined written as empty', () => {
    const result = stringifyEnv({ KEY: null });
    expect(result).toContain('KEY=');
  });

  test('sortKeys option orders output', () => {
    const result = stringifyEnv({ Z: '1', A: '2' }, { sortKeys: true });
    expect(result.indexOf('A=')).toBeLessThan(result.indexOf('Z='));
  });

  test('addNewline appends trailing newline', () => {
    const result = stringifyEnv({ X: 'y' }, { addNewline: true });
    expect(result.endsWith('\n')).toBe(true);
  });

  test('escapes double quotes inside values', () => {
    const result = stringifyEnv({ Q: 'say "hi"' });
    expect(result).toContain('Q="say \\"hi\\""');
  });
});

describe('mergeToString', () => {
  test('merges multiple env objects, last wins', () => {
    const result = mergeToString([{ A: '1' }, { A: '2', B: '3' }]);
    expect(result).toContain('A=2');
    expect(result).toContain('B=3');
  });
});

describe('roundTrip', () => {
  test('parse then re-serialize preserves values', () => {
    const raw = 'FOO=bar\nBAZ=123\n';
    const result = roundTrip(raw, parseEnv);
    const reparsed = parseEnv(result);
    expect(reparsed.FOO).toBe('bar');
    expect(reparsed.BAZ).toBe('123');
  });
});

describe('annotatedString', () => {
  test('marks added keys', () => {
    const result = annotatedString('A=1\n', 'A=1\nB=2\n', parseEnv);
    expect(result).toContain('# [added] B=2');
  });

  test('marks removed keys', () => {
    const result = annotatedString('A=1\nB=2\n', 'A=1\n', parseEnv);
    expect(result).toContain('# [removed] B=2');
  });

  test('marks changed keys', () => {
    const result = annotatedString('A=1\n', 'A=99\n', parseEnv);
    expect(result).toContain('# [changed] A=99');
  });

  test('unchanged keys have no comment marker', () => {
    const result = annotatedString('A=1\n', 'A=1\n', parseEnv);
    expect(result).toContain('A=1');
    expect(result).not.toContain('#');
  });
});
