const { sortByKey, groupByStatus, sortGrouped } = require('./sorter');

const entries = [
  { key: 'PORT', status: 'ok' },
  { key: 'API_KEY', status: 'missing' },
  { key: 'DB_HOST', status: 'mismatch' },
  { key: 'SECRET', status: 'extra' },
  { key: 'APP_ENV', status: 'missing' },
  { key: 'LOG_LEVEL', status: 'ok' },
];

describe('sortByKey', () => {
  test('sorts entries alphabetically by key', () => {
    const sorted = sortByKey(entries);
    const keys = sorted.map((e) => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  test('does not mutate the original array', () => {
    const original = [...entries];
    sortByKey(entries);
    expect(entries).toEqual(original);
  });
});

describe('groupByStatus', () => {
  test('groups entries by status correctly', () => {
    const groups = groupByStatus(entries);
    expect(groups.missing).toHaveLength(2);
    expect(groups.extra).toHaveLength(1);
    expect(groups.mismatch).toHaveLength(1);
    expect(groups.ok).toHaveLength(2);
  });

  test('puts unknown status into ok group', () => {
    const weird = [{ key: 'X', status: 'unknown_status' }];
    const groups = groupByStatus(weird);
    expect(groups.ok).toHaveLength(1);
  });

  test('handles missing status field', () => {
    const noStatus = [{ key: 'Y' }];
    const groups = groupByStatus(noStatus);
    expect(groups.ok).toHaveLength(1);
  });
});

describe('sortGrouped', () => {
  test('orders by missing → extra → mismatch → ok', () => {
    const sorted = sortGrouped(entries);
    const statuses = sorted.map((e) => e.status);
    const firstMismatchIdx = statuses.indexOf('mismatch');
    const lastExtraIdx = statuses.lastIndexOf('extra');
    const firstOkIdx = statuses.indexOf('ok');
    expect(lastExtraIdx).toBeLessThan(firstMismatchIdx);
    expect(firstMismatchIdx).toBeLessThan(firstOkIdx);
  });

  test('returns all entries', () => {
    const sorted = sortGrouped(entries);
    expect(sorted).toHaveLength(entries.length);
  });
});
