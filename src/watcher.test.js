import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { watchFiles, debounce } from './watcher.js';

vi.mock('fs');
vi.mock('./index.js', () => ({
  diffFiles: vi.fn(() => ({ added: [], missing: [], mismatched: [] })),
  loadEnvFile: vi.fn(),
}));
vi.mock('./reporter.js', () => ({
  formatReport: vi.fn(() => 'mock report'),
}));

describe('watchFiles', () => {
  let mockWatcher;

  beforeEach(() => {
    mockWatcher = { close: vi.fn() };
    fs.watch = vi.fn(() => mockWatcher);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets up a watcher for each file path', () => {
    const handle = watchFiles(['.env', '.env.staging'], { silent: true });
    expect(fs.watch).toHaveBeenCalledTimes(2);
    handle.stop();
    expect(mockWatcher.close).toHaveBeenCalledTimes(2);
  });

  it('calls onDiff when a change event fires', () => {
    const onDiff = vi.fn();
    fs.watch = vi.fn((filePath, cb) => {
      setTimeout(() => cb('change'), 0);
      return mockWatcher;
    });
    const handle = watchFiles(['.env'], { silent: true, onDiff });
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(onDiff).toHaveBeenCalled();
        handle.stop();
        resolve();
      }, 50);
    });
  });

  it('does not crash if fs.watch throws', () => {
    fs.watch = vi.fn(() => { throw new Error('ENOENT'); });
    expect(() => watchFiles(['.env.missing'], { silent: true })).not.toThrow();
  });
});

describe('debounce', () => {
  it('only calls fn once within delay window', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    debounced('b');
    debounced('c');
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
    vi.useRealTimers();
  });
});
