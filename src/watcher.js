import fs from 'fs';
import path from 'path';
import { loadEnvFile, diffFiles } from './index.js';
import { formatReport } from './reporter.js';

/**
 * Watch a list of env files for changes and re-run diff on each change.
 * @param {string[]} filePaths - paths to .env files
 * @param {object} options - { silent, onDiff }
 * @returns {{ stop: Function }} handle to stop watching
 */
export function watchFiles(filePaths, options = {}) {
  const { silent = false, onDiff = null } = options;
  const watchers = [];

  function handleChange(changedPath) {
    if (!silent) {
      console.log(`[envdiff] change detected: ${path.basename(changedPath)}`);
    }
    try {
      const result = diffFiles(filePaths);
      if (typeof onDiff === 'function') {
        onDiff(result, changedPath);
      } else if (!silent) {
        console.log(formatReport(result));
      }
    } catch (err) {
      console.error(`[envdiff] error re-diffing: ${err.message}`);
    }
  }

  for (const filePath of filePaths) {
    const resolved = path.resolve(filePath);
    try {
      const watcher = fs.watch(resolved, (eventType) => {
        if (eventType === 'change') {
          handleChange(resolved);
        }
      });
      watchers.push(watcher);
    } catch (err) {
      console.error(`[envdiff] cannot watch ${filePath}: ${err.message}`);
    }
  }

  return {
    stop() {
      for (const w of watchers) w.close();
    },
  };
}

/**
 * Returns a debounced version of fn with the given delay (ms).
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
