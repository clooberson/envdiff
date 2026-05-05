const { parseEnv } = require('./parser');

describe('parseEnv', () => {
  test('parses simple key=value pairs', () => {
    const input = 'FOO=bar\nBAZ=qux';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores blank lines', () => {
    const input = '\nFOO=bar\n\nBAZ=qux\n';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores comment lines', () => {
    const input = '# this is a comment\nFOO=bar';
    expect(parseEnv(input)).toEqual({ FOO: 'bar' });
  });

  test('strips inline comments', () => {
    const input = 'FOO=bar # this is inline';
    expect(parseEnv(input)).toEqual({ FOO: 'bar' });
  });

  test('handles double-quoted values', () => {
    const input = 'FOO="hello world"';
    expect(parseEnv(input)).toEqual({ FOO: 'hello world' });
  });

  test('handles single-quoted values', () => {
    const input = "FOO='hello world'";
    expect(parseEnv(input)).toEqual({ FOO: 'hello world' });
  });

  test('preserves # inside quoted values', () => {
    const input = 'FOO="bar#baz"';
    expect(parseEnv(input)).toEqual({ FOO: 'bar#baz' });
  });

  test('handles values with equals sign', () => {
    const input = 'FOO=bar=baz';
    expect(parseEnv(input)).toEqual({ FOO: 'bar=baz' });
  });

  test('ignores lines without equals sign', () => {
    const input = 'INVALID_LINE\nFOO=bar';
    expect(parseEnv(input)).toEqual({ FOO: 'bar' });
  });

  test('handles empty values', () => {
    const input = 'FOO=';
    expect(parseEnv(input)).toEqual({ FOO: '' });
  });

  test('handles Windows-style line endings', () => {
    const input = 'FOO=bar\r\nBAZ=qux';
    expect(parseEnv(input)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
