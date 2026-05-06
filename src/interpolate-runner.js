/**
 * interpolate-runner.js
 * CLI-facing runner that loads an env file, interpolates it,
 * and reports any unresolved references.
 */

const { loadEnvFile } = require('./index');
const { interpolateEnv, findUnresolvedRefs } = require('./interpolator');
const { colorize } = require('./reporter');

/**
 * Format a single unresolved ref entry for display.
 * @param {{key: string, refs: string[]}} entry
 * @returns {string}
 */
function formatUnresolved(entry) {
  return `  ${colorize('warn', entry.key)}: references undefined [${entry.refs.join(', ')}]`;
}

/**
 * Run interpolation on a file and print results.
 * @param {string} filePath
 * @param {{verbose?: boolean}} options
 * @returns {{ interpolated: Record<string, string>, unresolved: Array }}
 */
function runInterpolation(filePath, options = {}) {
  const env = loadEnvFile(filePath);
  const interpolated = interpolateEnv(env);
  const unresolved = findUnresolvedRefs(env);

  if (options.verbose) {
    console.log(colorize('info', `Interpolated ${filePath}:`));
    for (const [key, value] of Object.entries(interpolated)) {
      console.log(`  ${key}=${value}`);
    }
  }

  if (unresolved.length === 0) {
    console.log(colorize('ok', `No unresolved references in ${filePath}`));
  } else {
    console.log(colorize('warn', `Unresolved references in ${filePath}:`));
    for (const entry of unresolved) {
      console.log(formatUnresolved(entry));
    }
  }

  return { interpolated, unresolved };
}

module.exports = { formatUnresolved, runInterpolation };
