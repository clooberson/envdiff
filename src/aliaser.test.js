const { buildReverseMap, resolveAliases, findAliasedKeys, buildAliasSummary } = require('./aliaser');

const aliasMap = {
  DATABASE_URL: ['DB_URL', 'DB_CONNECTION'],
  API_KEY: ['APIKEY', 'API_TOKEN'],
};

describe('buildReverseMap', () => {
  it('maps each alias to its canonical key', () => {
    const rev = buildReverseMap(aliasMap);
    expect(rev['DB_URL']).toBe('DATABASE_URL');
    expect(rev['DB_CONNECTION']).toBe('DATABASE_URL');
    expect(rev['APIKEY']).toBe('API_KEY');
    expect(rev['API_TOKEN']).toBe('API_KEY');
  });

  it('returns empty object for empty aliasMap', () => {
    expect(buildReverseMap({})).toEqual({});
  });
});

describe('resolveAliases', () => {
  it('renames alias keys to canonical', () => {
    const env = { DB_URL: 'postgres://localhost/db', PORT: '3000' };
    const result = resolveAliases(env, aliasMap);
    expect(result).toHaveProperty('DATABASE_URL', 'postgres://localhost/db');
    expect(result).toHaveProperty('PORT', '3000');
    expect(result).not.toHaveProperty('DB_URL');
  });

  it('canonical key wins over alias when both present', () => {
    const env = { DB_URL: 'alias-value', DATABASE_URL: 'canonical-value' };
    const result = resolveAliases(env, aliasMap);
    expect(result['DATABASE_URL']).toBe('canonical-value');
  });

  it('leaves non-alias keys unchanged', () => {
    const env = { PORT: '8080', HOST: 'localhost' };
    expect(resolveAliases(env, aliasMap)).toEqual(env);
  });
});

describe('findAliasedKeys', () => {
  it('returns alias entries found in env', () => {
    const env = { DB_URL: 'x', APIKEY: 'y', PORT: '3000' };
    const found = findAliasedKeys(env, aliasMap);
    expect(found).toHaveLength(2);
    expect(found).toContainEqual({ alias: 'DB_URL', canonical: 'DATABASE_URL' });
    expect(found).toContainEqual({ alias: 'APIKEY', canonical: 'API_KEY' });
  });

  it('returns empty array when no aliases present', () => {
    expect(findAliasedKeys({ PORT: '80' }, aliasMap)).toEqual([]);
  });
});

describe('buildAliasSummary', () => {
  it('reports resolved count and no conflicts', () => {
    const env = { DB_URL: 'x', PORT: '3000' };
    const summary = buildAliasSummary(env, aliasMap);
    expect(summary.resolved).toBe(1);
    expect(summary.conflicts).toBe(0);
    expect(summary.details[0]).toMatchObject({ alias: 'DB_URL', canonical: 'DATABASE_URL', conflict: false });
  });

  it('detects conflicts when alias and canonical both exist', () => {
    const env = { DB_URL: 'alias-val', DATABASE_URL: 'real-val' };
    const summary = buildAliasSummary(env, aliasMap);
    expect(summary.conflicts).toBe(1);
    expect(summary.details[0].conflict).toBe(true);
  });
});
