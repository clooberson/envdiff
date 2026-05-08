const { envToTemplate, mergeTemplates, serializeTemplate, buildTemplate } = require('./templater');

describe('envToTemplate', () => {
  test('strips all values to empty string', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    expect(envToTemplate(env)).toEqual({ FOO: '', BAZ: '' });
  });

  test('marks required keys with placeholder', () => {
    const env = { FOO: 'bar', SECRET: 'abc' };
    const result = envToTemplate(env, { requiredKeys: ['SECRET'] });
    expect(result.SECRET).toBe('<required>');
    expect(result.FOO).toBe('');
  });

  test('returns empty object for empty env', () => {
    expect(envToTemplate({})).toEqual({});
  });
});

describe('mergeTemplates', () => {
  test('unions keys from multiple envs', () => {
    const a = { FOO: '1', BAR: '2' };
    const b = { BAR: 'x', BAZ: 'y' };
    const result = mergeTemplates([a, b]);
    expect(Object.keys(result).sort()).toEqual(['BAR', 'BAZ', 'FOO']);
  });

  test('all values are empty by default', () => {
    const result = mergeTemplates([{ A: '1' }, { B: '2' }]);
    expect(Object.values(result).every(v => v === '')).toBe(true);
  });

  test('respects requiredKeys option', () => {
    const result = mergeTemplates([{ A: '1', B: '2' }], { requiredKeys: ['A'] });
    expect(result.A).toBe('<required>');
    expect(result.B).toBe('');
  });
});

describe('serializeTemplate', () => {
  test('produces KEY=value lines', () => {
    const tmpl = { FOO: '', BAR: '<required>' };
    const out = serializeTemplate(tmpl);
    expect(out).toContain('FOO=');
    expect(out).toContain('BAR=<required>');
  });

  test('includes header comment when provided', () => {
    const out = serializeTemplate({ X: '' }, { header: 'Template file' });
    expect(out.startsWith('# Template file')).toBe(true);
  });

  test('ends with newline', () => {
    const out = serializeTemplate({ A: '' });
    expect(out.endsWith('\n')).toBe(true);
  });
});

describe('buildTemplate', () => {
  test('full pipeline produces valid template string', () => {
    const envs = [{ FOO: 'hello', DB: 'postgres' }, { FOO: 'world', PORT: '3000' }];
    const out = buildTemplate(envs, { header: 'Generated', requiredKeys: ['DB'] });
    expect(out).toContain('FOO=');
    expect(out).toContain('DB=<required>');
    expect(out).toContain('PORT=');
    expect(out).toContain('# Generated');
  });
});
