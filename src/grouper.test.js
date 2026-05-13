const { extractPrefix, groupByPrefix, groupKeysAcrossEnvs, buildGroupSummary } = require('./grouper');

describe('extractPrefix', () => {
  it('extracts prefix before first underscore', () => {
    expect(extractPrefix('DB_HOST')).toBe('DB');
    expect(extractPrefix('AWS_S3_BUCKET')).toBe('AWS');
  });

  it('returns __ungrouped__ for keys with no separator', () => {
    expect(extractPrefix('PORT')).toBe('__ungrouped__');
    expect(extractPrefix('DEBUG')).toBe('__ungrouped__');
  });

  it('respects custom separator', () => {
    expect(extractPrefix('DB.HOST', '.')).toBe('DB');
    expect(extractPrefix('NODOT', '.')).toBe('__ungrouped__');
  });
});

describe('groupByPrefix', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp', PORT: '3000' };

  it('groups keys by prefix', () => {
    const result = groupByPrefix(env);
    expect(result['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result['APP']).toEqual({ APP_NAME: 'myapp' });
    expect(result['__ungrouped__']).toEqual({ PORT: '3000' });
  });

  it('returns empty object for empty env', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('groupKeysAcrossEnvs', () => {
  const envA = { DB_HOST: 'localhost', APP_NAME: 'a' };
  const envB = { DB_HOST: 'prod-db', DB_PASS: 'secret', PORT: '80' };

  it('merges keys from multiple envs by prefix', () => {
    const result = groupKeysAcrossEnvs([envA, envB]);
    expect(result['DB']).toContain('DB_HOST');
    expect(result['DB']).toContain('DB_PASS');
    expect(result['APP']).toEqual(['APP_NAME']);
    expect(result['__ungrouped__']).toEqual(['PORT']);
  });

  it('deduplicates keys', () => {
    const result = groupKeysAcrossEnvs([envA, envB]);
    const dbKeys = result['DB'];
    expect(dbKeys.length).toBe(new Set(dbKeys).size);
  });

  it('handles single env', () => {
    const result = groupKeysAcrossEnvs([envA]);
    expect(result['DB']).toEqual(['DB_HOST']);
  });
});

describe('buildGroupSummary', () => {
  it('counts keys per prefix from groupByPrefix result', () => {
    const env = { DB_HOST: 'h', DB_PORT: '5432', APP_NAME: 'x' };
    const grouped = groupByPrefix(env);
    const summary = buildGroupSummary(grouped);
    expect(summary['DB']).toBe(2);
    expect(summary['APP']).toBe(1);
  });

  it('counts keys per prefix from groupKeysAcrossEnvs result', () => {
    const result = groupKeysAcrossEnvs([{ DB_HOST: 'h', DB_PORT: '5432' }]);
    const summary = buildGroupSummary(result);
    expect(summary['DB']).toBe(2);
  });
});
