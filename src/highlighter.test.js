const { highlightLine, highlightEnv, highlightParsed } = require('./highlighter');

const RESET = '\x1b[0m';

describe('highlightLine', () => {
  test('returns line unchanged when color disabled', () => {
    expect(highlightLine('KEY=value', false)).toBe('KEY=value');
  });

  test('returns empty string for blank line', () => {
    expect(highlightLine('', true)).toBe('');
    expect(highlightLine('   ', true)).toBe('   ');
  });

  test('colorizes comment lines', () => {
    const result = highlightLine('# this is a comment', true);
    expect(result).toContain('# this is a comment');
    expect(result).toContain(RESET);
    expect(result.startsWith('\x1b[')).toBe(true);
  });

  test('colorizes key=value lines', () => {
    const result = highlightLine('API_KEY=secret', true);
    expect(result).toContain('API_KEY');
    expect(result).toContain('secret');
    expect(result).toContain('=');
    expect(result).toContain(RESET);
  });

  test('handles line with no equals sign', () => {
    const result = highlightLine('JUST_A_KEY', true);
    expect(result).toContain('JUST_A_KEY');
    expect(result).toContain(RESET);
  });

  test('handles value with equals signs inside', () => {
    const result = highlightLine('URL=http://x.com?a=1&b=2', true);
    expect(result).toContain('URL');
    expect(result).toContain('http://x.com?a=1&b=2');
  });
});

describe('highlightEnv', () => {
  test('highlights multiple lines', () => {
    const raw = '# comment\nKEY=val\nOTHER=123';
    const result = highlightEnv(raw, true);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    lines.forEach(line => expect(line).toContain(RESET));
  });

  test('no color mode returns raw unchanged', () => {
    const raw = '# comment\nKEY=val';
    expect(highlightEnv(raw, false)).toBe(raw);
  });
});

describe('highlightParsed', () => {
  test('renders parsed env object as highlighted lines', () => {
    const env = { FOO: 'bar', BAZ: '42' };
    const result = highlightParsed(env, true);
    expect(result).toContain('FOO');
    expect(result).toContain('bar');
    expect(result).toContain('BAZ');
    expect(result).toContain('42');
  });

  test('no color returns plain key=value lines', () => {
    const env = { A: '1', B: '2' };
    const result = highlightParsed(env, false);
    expect(result).toBe('A=1\nB=2');
  });
});
