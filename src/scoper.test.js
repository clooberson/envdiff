const { scopeEnv, stripScope, listScopes, scopeDiff } = require('./scoper');

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envdiff',
  APP_ENV: 'test',
  SECRET: 'abc',
};

describe('scopeEnv', () => {
  it('returns only keys with the given prefix', () => {
    expect(scopeEnv(env, 'DB')).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('handles prefix with trailing underscore', () => {
    expect(scopeEnv(env, 'APP_')).toEqual({ APP_NAME: 'envdiff', APP_ENV: 'test' });
  });

  it('returns empty object when no keys match', () => {
    expect(scopeEnv(env, 'REDIS')).toEqual({});
  });
});

describe('stripScope', () => {
  it('strips the prefix from matching keys', () => {
    expect(stripScope(env, 'DB')).toEqual({ HOST: 'localhost', PORT: '5432' });
  });

  it('ignores keys that do not match', () => {
    const result = stripScope(env, 'APP');
    expect(result).toEqual({ NAME: 'envdiff', ENV: 'test' });
    expect(result.SECRET).toBeUndefined();
  });
});

describe('listScopes', () => {
  it('returns sorted unique scope prefixes', () => {
    expect(listScopes(env)).toEqual(['APP', 'DB']);
  });

  it('excludes keys with no underscore', () => {
    const result = listScopes({ PLAIN: '1', A_B: '2' });
    expect(result).toEqual(['A']);
  });

  it('returns empty array for empty env', () => {
    expect(listScopes({})).toEqual([]);
  });
});

describe('scopeDiff', () => {
  const a = { DB_HOST: 'localhost', DB_PORT: '5432', DB_NAME: 'mydb' };
  const b = { DB_HOST: 'remotehost', DB_PORT: '5432', DB_USER: 'admin' };

  it('identifies keys only in a', () => {
    const result = scopeDiff(a, b, 'DB');
    expect(result.only_a).toEqual(['DB_NAME']);
  });

  it('identifies keys only in b', () => {
    const result = scopeDiff(a, b, 'DB');
    expect(result.only_b).toEqual(['DB_USER']);
  });

  it('identifies differing shared keys', () => {
    const result = scopeDiff(a, b, 'DB');
    expect(result.diff).toEqual(['DB_HOST']);
  });

  it('returns correct scope label', () => {
    expect(scopeDiff(a, b, 'DB').scope).toBe('DB');
  });
});
