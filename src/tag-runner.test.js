const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatTagReport, runTag } = require('./tag-runner');
const { buildTagMap } = require('./tagger');

function writeTmp(content, ext = '.env') {
  const p = path.join(os.tmpdir(), `envdiff-tag-${Date.now()}${ext}`);
  fs.writeFileSync(p, content);
  return p;
}

const env = { DB_HOST: 'localhost', DB_PASS: 'secret', PORT: '3000' };
const tagsConfig = { sensitive: ['^DB_PASS$'], network: ['^(PORT|DB_HOST)$'] };

describe('formatTagReport', () => {
  test('lists all keys with their tags when no filter given', () => {
    const map = buildTagMap(env, tagsConfig);
    const report = formatTagReport(env, map, []);
    expect(report).toContain('DB_PASS');
    expect(report).toContain('sensitive');
    expect(report).toContain('PORT');
    expect(report).toContain('network');
  });

  test('filters to matching keys when filterTags provided', () => {
    const map = buildTagMap(env, tagsConfig);
    const report = formatTagReport(env, map, ['sensitive']);
    expect(report).toContain('DB_PASS');
    expect(report).not.toContain('PORT');
  });

  test('returns no-match message when filter yields nothing', () => {
    const map = buildTagMap(env, tagsConfig);
    const report = formatTagReport(env, map, ['nonexistent']);
    expect(report).toMatch(/no keys match/i);
  });
});

describe('runTag', () => {
  test('returns no-config message when tags config is empty', () => {
    const p = writeTmp('FOO=bar\nBAZ=qux\n');
    const result = runTag(p, { tags: {} });
    expect(result.output).toMatch(/no tags configured/i);
  });

  test('returns tagged key map for valid config', () => {
    const p = writeTmp('DB_PASS=secret\nPORT=3000\n');
    const result = runTag(p, { tags: tagsConfig });
    expect(result.keys.length).toBeGreaterThan(0);
    expect(result.tagMap['DB_PASS']).toContain('sensitive');
  });

  test('filterTags narrows returned keys', () => {
    const p = writeTmp('DB_PASS=secret\nPORT=3000\n');
    const result = runTag(p, { tags: tagsConfig, filterTags: ['network'] });
    expect(result.keys).toContain('PORT');
    expect(result.keys).not.toContain('DB_PASS');
  });
});
