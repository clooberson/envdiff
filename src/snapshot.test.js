const fs = require('fs');
const os = require('os');
const path = require('path');
const { saveSnapshot, loadSnapshot, diffSnapshot, defaultSnapshotPath } = require('./snapshot');

function tmpFile(name) {
  return path.join(os.tmpdir(), `envdiff-snapshot-test-${name}-${Date.now()}.json`);
}

describe('saveSnapshot / loadSnapshot', () => {
  test('round-trips env data', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    const p = tmpFile('save');
    const saved = saveSnapshot(env, p);
    expect(saved.env).toEqual(env);
    expect(typeof saved.timestamp).toBe('string');

    const loaded = loadSnapshot(p);
    expect(loaded.env).toEqual(env);
    expect(loaded.timestamp).toBe(saved.timestamp);
    fs.unlinkSync(p);
  });

  test('loadSnapshot throws if file missing', () => {
    expect(() => loadSnapshot('/nonexistent/path.json')).toThrow('Snapshot not found');
  });
});

describe('diffSnapshot', () => {
  const snap = { A: '1', B: '2', C: '3' };

  test('detects added keys', () => {
    const result = diffSnapshot({ A: '1', B: '2', C: '3', D: '4' }, snap);
    expect(result.added).toEqual(['D']);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
  });

  test('detects removed keys', () => {
    const result = diffSnapshot({ A: '1', B: '2' }, snap);
    expect(result.removed).toEqual(['C']);
    expect(result.added).toEqual([]);
  });

  test('detects changed values', () => {
    const result = diffSnapshot({ A: '1', B: 'NEW', C: '3' }, snap);
    expect(result.changed).toEqual(['B']);
  });

  test('returns empty diff for identical envs', () => {
    const result = diffSnapshot({ ...snap }, snap);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
  });
});

describe('defaultSnapshotPath', () => {
  test('places snapshot next to env file with dot prefix', () => {
    const p = defaultSnapshotPath('/project/.env.production');
    expect(p).toBe('/project/..env.production.snapshot.json');
  });

  test('works with simple filename', () => {
    const p = defaultSnapshotPath('/app/.env');
    expect(p).toBe('/app/..env.snapshot.json');
  });
});
