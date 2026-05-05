'use strict';

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.resolve(__dirname, 'cli.js');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cli diff command', () => {
  let base, compare;

  beforeAll(() => {
    base = writeTmp('base.env', 'KEY_A=hello\nKEY_B=world\nKEY_C=same\n');
    compare = writeTmp('compare.env', 'KEY_A=hello\nKEY_C=same\nKEY_D=extra\n');
  });

  test('exits with code 1 when there are differences', () => {
    const result = spawnSync('node', [CLI, 'diff', base, compare], { encoding: 'utf8' });
    expect(result.status).toBe(1);
  });

  test('outputs text report by default', () => {
    const result = spawnSync('node', [CLI, 'diff', base, compare], { encoding: 'utf8' });
    expect(result.stdout).toMatch(/KEY_B/);
  });

  test('outputs json when --format json', () => {
    const result = spawnSync('node', [CLI, 'diff', '--format', 'json', base, compare], { encoding: 'utf8' });
    const parsed = JSON.parse(result.stdout);
    expect(parsed).toHaveProperty('missing');
    expect(parsed).toHaveProperty('mismatched');
  });

  test('quiet flag suppresses output but preserves exit code', () => {
    const result = spawnSync('node', [CLI, 'diff', '--quiet', base, compare], { encoding: 'utf8' });
    expect(result.stdout.trim()).toBe('');
    expect(result.status).toBe(1);
  });

  test('exits 0 when files are identical', () => {
    const result = spawnSync('node', [CLI, 'diff', base, base], { encoding: 'utf8' });
    expect(result.status).toBe(0);
  });

  test('exits 2 on missing file', () => {
    const result = spawnSync('node', [CLI, 'diff', base, '/nonexistent/.env'], { encoding: 'utf8' });
    expect(result.status).toBe(2);
  });
});
