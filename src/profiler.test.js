const { countByStatus, sharedPercent, uniqueKeys, buildProfile } = require('./profiler');

const sampleGrouped = {
  shared: [
    { key: 'APP_NAME', values: { dev: 'app', prod: 'app' } },
    { key: 'PORT', values: { dev: '3000', prod: '3000' } },
  ],
  mismatched: [
    { key: 'DB_URL', values: { dev: 'localhost', prod: 'db.prod' } },
  ],
  'only:dev': [
    { key: 'DEBUG', values: { dev: 'true' } },
  ],
  'only:prod': [
    { key: 'CDN_URL', values: { prod: 'https://cdn.example.com' } },
  ],
};

describe('countByStatus', () => {
  it('counts entries per status', () => {
    const counts = countByStatus(sampleGrouped);
    expect(counts.shared).toBe(2);
    expect(counts.mismatched).toBe(1);
    expect(counts['only:dev']).toBe(1);
    expect(counts['only:prod']).toBe(1);
  });

  it('returns 0 for empty grouped', () => {
    const counts = countByStatus({});
    expect(Object.values(counts).length).toBe(0);
  });
});

describe('sharedPercent', () => {
  it('calculates correct percentage', () => {
    const counts = countByStatus(sampleGrouped);
    expect(sharedPercent(counts)).toBe(40); // 2 of 5
  });

  it('returns 100 when total is 0', () => {
    expect(sharedPercent({})).toBe(100);
  });
});

describe('uniqueKeys', () => {
  it('returns keys from only:* statuses', () => {
    const keys = uniqueKeys(sampleGrouped);
    expect(keys).toContain('DEBUG');
    expect(keys).toContain('CDN_URL');
    expect(keys).not.toContain('APP_NAME');
    expect(keys).not.toContain('DB_URL');
  });
});

describe('buildProfile', () => {
  it('builds a complete profile object', () => {
    const profile = buildProfile(sampleGrouped, ['dev', 'prod']);
    expect(profile.envCount).toBe(2);
    expect(profile.totalKeys).toBe(5);
    expect(profile.sharedPercent).toBe(40);
    expect(profile.uniqueKeys).toHaveLength(2);
    expect(profile.healthy).toBe(false);
  });

  it('marks healthy when no mismatches or unique keys', () => {
    const clean = { shared: [{ key: 'X', values: {} }] };
    const profile = buildProfile(clean, ['dev', 'prod']);
    expect(profile.healthy).toBe(true);
  });
});
