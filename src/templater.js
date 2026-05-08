/**
 * templater.js — Generate .env template files from parsed envs
 * Strips values, keeps keys and optional comments
 */

/**
 * Convert a parsed env object into a template (keys with empty values)
 * @param {Object} env - parsed env map { KEY: value }
 * @param {Object} [options]
 * @param {boolean} [options.keepComments] - preserve inline comments as hints
 * @param {string[]} [options.requiredKeys] - mark these keys as required
 * @returns {Object} template map { KEY: '' }
 */
function envToTemplate(env, options = {}) {
  const { requiredKeys = [] } = options;
  const template = {};
  for (const key of Object.keys(env)) {
    template[key] = requiredKeys.includes(key) ? '<required>' : '';
  }
  return template;
}

/**
 * Merge multiple env templates, unioning all keys
 * @param {Object[]} envs - array of parsed env maps
 * @param {Object} [options]
 * @returns {Object} merged template
 */
function mergeTemplates(envs, options = {}) {
  const allKeys = new Set(envs.flatMap(e => Object.keys(e)));
  const merged = {};
  const { requiredKeys = [] } = options;
  for (const key of allKeys) {
    merged[key] = requiredKeys.includes(key) ? '<required>' : '';
  }
  return merged;
}

/**
 * Serialize a template map to .env file string
 * @param {Object} template
 * @param {Object} [options]
 * @param {string} [options.header] - optional header comment
 * @returns {string}
 */
function serializeTemplate(template, options = {}) {
  const { header } = options;
  const lines = [];
  if (header) {
    lines.push(`# ${header}`);
    lines.push('');
  }
  for (const [key, val] of Object.entries(template)) {
    lines.push(`${key}=${val}`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Full pipeline: envs -> merged template string
 * @param {Object[]} envs
 * @param {Object} [options]
 * @returns {string}
 */
function buildTemplate(envs, options = {}) {
  const template = mergeTemplates(envs, options);
  return serializeTemplate(template, options);
}

module.exports = { envToTemplate, mergeTemplates, serializeTemplate, buildTemplate };
