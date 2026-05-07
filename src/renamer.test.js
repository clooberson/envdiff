const { renameKey, applyRenames, renameAll, renameSummary } = require('./renamer');

describe('renameKey', () => {
  const env = { FOO: 'bar', BAZ: 'qux' };

  test('renames an existing key', () => {
    const result = renameKey(env, 'FOO', 'FOO_NEW');
    expect(result).toHaveProperty('FOO_NEW', 'bar');
    expect(result).not.toHaveProperty('FOO');
    expect(result).toHaveProperty('BAZ', 'qux');
  });

  test('returns copy unchanged when key not found', () => {
    const result = renameKey(env, 'MISSING', 'WHATEVER');
    expect(result).toEqual(env);
    expect(result).not.toBe(env);
  });

  test('does not mutate original', () => {
    renameKey(env, 'FOO', 'FOO2');
    expect(env).toHaveProperty('FOO');
  });
});

describe('applyRenames', () => {
  test('applies multiple renames', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = applyRenames(env, { A: 'ALPHA', B: 'BETA' });
    expect(result).toEqual({ ALPHA: '1', BETA: '2', C: '3' });
  });

  test('skips keys not present', () => {
    const env = { X: '9' };
    const result = applyRenames(env, { Y: 'Z' });
    expect(result).toEqual({ X: '9' });
  });
});

describe('renameAll', () => {
  test('renames across multiple envs', () => {
    const envs = {
      dev: { OLD_KEY: 'dev_val', KEEP: 'yes' },
      prod: { OLD_KEY: 'prod_val', KEEP: 'also' },
    };
    const result = renameAll(envs, { OLD_KEY: 'NEW_KEY' });
    expect(result.dev).toEqual({ NEW_KEY: 'dev_val', KEEP: 'yes' });
    expect(result.prod).toEqual({ NEW_KEY: 'prod_val', KEEP: 'also' });
  });
});

describe('renameSummary', () => {
  test('reports renamed and skipped keys', () => {
    const env = { FOO: '1', BAR: '2' };
    const summary = renameSummary(env, { FOO: 'FOO_V2', MISSING: 'WHATEVER' });
    expect(summary.renamed).toContain('FOO');
    expect(summary.skipped).toContain('MISSING');
  });

  test('all skipped when env is empty', () => {
    const summary = renameSummary({}, { A: 'B' });
    expect(summary.renamed).toHaveLength(0);
    expect(summary.skipped).toContain('A');
  });
});
