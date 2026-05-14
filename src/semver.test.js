const { parseSemver, semverDiff, semverDiffEnvs, formatSemverDiff } = require('./semver');

describe('parseSemver', () => {
  test('parses standard semver', () => {
    expect(parseSemver('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, raw: '1.2.3' });
  });

  test('parses semver with v prefix', () => {
    expect(parseSemver('v2.0.1')).toMatchObject({ major: 2, minor: 0, patch: 1 });
  });

  test('parses semver with pre-release tag', () => {
    expect(parseSemver('1.4.0-beta.1')).toMatchObject({ major: 1, minor: 4, patch: 0 });
  });

  test('returns null for non-semver', () => {
    expect(parseSemver('latest')).toBeNull();
    expect(parseSemver('1.2')).toBeNull();
    expect(parseSemver('')).toBeNull();
  });
});

describe('semverDiff', () => {
  test('detects major diff', () => {
    expect(semverDiff('1.0.0', '2.0.0')).toBe('major');
  });

  test('detects minor diff', () => {
    expect(semverDiff('1.0.0', '1.1.0')).toBe('minor');
  });

  test('detects patch diff', () => {
    expect(semverDiff('1.0.0', '1.0.1')).toBe('patch');
  });

  test('returns equal when same', () => {
    expect(semverDiff('2.3.4', '2.3.4')).toBe('equal');
  });

  test('returns null when not semver', () => {
    expect(semverDiff('latest', '1.0.0')).toBeNull();
    expect(semverDiff('1.0.0', 'stable')).toBeNull();
  });
});

describe('semverDiffEnvs', () => {
  const envA = { NODE_VERSION: '16.0.0', APP_VERSION: '1.2.3', DB_HOST: 'localhost' };
  const envB = { NODE_VERSION: '18.0.0', APP_VERSION: '1.2.3', DB_HOST: 'db.prod' };

  test('finds semver diffs between envs', () => {
    const rows = semverDiffEnvs(envA, envB);
    expect(rows).toHaveLength(2);
    expect(rows.find(r => r.key === 'NODE_VERSION')).toMatchObject({ diff: 'major' });
    expect(rows.find(r => r.key === 'APP_VERSION')).toMatchObject({ diff: 'equal' });
  });

  test('skips non-semver keys', () => {
    const rows = semverDiffEnvs(envA, envB);
    expect(rows.find(r => r.key === 'DB_HOST')).toBeUndefined();
  });

  test('skips keys missing in one env', () => {
    const rows = semverDiffEnvs({ ONLY_A: '1.0.0' }, { OTHER: '2.0.0' });
    expect(rows).toHaveLength(0);
  });
});

describe('formatSemverDiff', () => {
  test('returns message when no rows', () => {
    expect(formatSemverDiff([])).toBe('No semver differences found.');
  });

  test('formats rows with bump label', () => {
    const rows = [{ key: 'NODE_VERSION', a: '16.0.0', b: '18.0.0', diff: 'major' }];
    const out = formatSemverDiff(rows);
    expect(out).toContain('NODE_VERSION');
    expect(out).toContain('↑major');
    expect(out).toContain('16.0.0 → 18.0.0');
  });
});
