const { buildTagMap, filterByTags, serializeTagMap, tagDiffRows } = require('./tagger');

const env = { DB_HOST: 'localhost', DB_PASS: 'secret', API_KEY: 'abc', PORT: '3000' };
const tagsConfig = {
  database: ['^DB_'],
  sensitive: ['^DB_PASS$', '_KEY$'],
  network: ['^(PORT|HOST)$', '_HOST$']
};

describe('buildTagMap', () => {
  test('assigns correct tags to each key', () => {
    const map = buildTagMap(env, tagsConfig);
    expect([...map.get('DB_HOST')]).toEqual(expect.arrayContaining(['database', 'network']));
    expect([...map.get('DB_PASS')]).toEqual(expect.arrayContaining(['database', 'sensitive']));
    expect([...map.get('API_KEY')]).toContain('sensitive');
    expect([...map.get('PORT')]).toContain('network');
  });

  test('key with no matching tags has empty set', () => {
    const map = buildTagMap({ UNTAGGED: '1' }, tagsConfig);
    expect(map.get('UNTAGGED').size).toBe(0);
  });
});

describe('filterByTags', () => {
  const map = buildTagMap(env, tagsConfig);

  test('returns keys matching a single tag', () => {
    const keys = filterByTags(map, ['database']);
    expect(keys).toEqual(expect.arrayContaining(['DB_HOST', 'DB_PASS']));
    expect(keys).not.toContain('API_KEY');
  });

  test('returns keys matching multiple tags (AND logic)', () => {
    const keys = filterByTags(map, ['database', 'sensitive']);
    expect(keys).toEqual(['DB_PASS']);
  });

  test('returns empty array when no keys match all tags', () => {
    const keys = filterByTags(map, ['database', 'network', 'sensitive']);
    expect(keys).toEqual([]);
  });
});

describe('serializeTagMap', () => {
  test('converts map to plain object with sorted tag arrays', () => {
    const map = buildTagMap(env, tagsConfig);
    const obj = serializeTagMap(map);
    expect(Array.isArray(obj['DB_HOST'])).toBe(true);
    expect(obj['DB_HOST']).toEqual([...obj['DB_HOST']].sort());
    expect(obj['API_KEY']).toContain('sensitive');
  });
});

describe('tagDiffRows', () => {
  test('attaches tags to rows', () => {
    const map = buildTagMap(env, tagsConfig);
    const rows = [{ key: 'DB_PASS', status: 'changed' }, { key: 'PORT', status: 'same' }];
    const tagged = tagDiffRows(rows, map);
    expect(tagged[0].tags).toContain('sensitive');
    expect(tagged[1].tags).toContain('network');
  });

  test('row without key in map gets empty tags', () => {
    const map = buildTagMap(env, tagsConfig);
    const rows = [{ key: 'GHOST', status: 'missing' }];
    const tagged = tagDiffRows(rows, map);
    expect(tagged[0].tags).toEqual([]);
  });
});
