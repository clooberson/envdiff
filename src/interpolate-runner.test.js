const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatUnresolved, runInterpolation } = require('./interpolate-runner');

function writeTmp(content) {
  const file = path.join(os.tmpdir(), `envdiff-interp-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('formatUnresolved', () => {
  test('formats an unresolved entry with key and refs', () => {
    const entry = { key: 'DATABASE_URL', refs: ['DB_HOST', 'DB_PORT'] };
    const result = formatUnresolved(entry);
    expect(result).toContain('DATABASE_URL');
    expect(result).toContain('DB_HOST');
    expect(result).toContain('DB_PORT');
  });
});

describe('runInterpolation', () => {
  test('returns interpolated values and empty unresolved for self-contained env', () => {
    const file = writeTmp('BASE=/app\nLOG=${BASE}/logs\n');
    const { interpolated, unresolved } = runInterpolation(file);
    expect(interpolated.LOG).toBe('/app/logs');
    expect(unresolved).toHaveLength(0);
    fs.unlinkSync(file);
  });

  test('returns unresolved refs when references are missing', () => {
    const file = writeTmp('URL=${PROTO}://example.com\n');
    const { unresolved } = runInterpolation(file);
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0].key).toBe('URL');
    expect(unresolved[0].refs).toContain('PROTO');
    fs.unlinkSync(file);
  });

  test('verbose mode does not throw', () => {
    const file = writeTmp('HOST=localhost\nPORT=3000\nURL=${HOST}:${PORT}\n');
    expect(() => runInterpolation(file, { verbose: true })).not.toThrow();
    fs.unlinkSync(file);
  });
});
