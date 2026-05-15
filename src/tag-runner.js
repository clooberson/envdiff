// tag-runner.js — CLI runner for the tagger feature
const fs = require('fs');
const { loadEnvFile } = require('./index');
const { buildTagMap, filterByTags, serializeTagMap } = require('./tagger');
const { loadConfig } = require('./config');

function formatTagReport(env, tagMap, filterTags) {
  const lines = [];
  const keys = filterTags && filterTags.length
    ? filterByTags(tagMap, filterTags)
    : Object.keys(env);

  if (keys.length === 0) {
    return '(no keys match the given tags)';
  }

  const serialized = serializeTagMap(tagMap);
  for (const key of keys.sort()) {
    const tags = (serialized[key] || []).join(', ') || '(none)';
    lines.push(`  ${key.padEnd(30)} [${tags}]`);
  }
  return lines.join('\n');
}

function runTag(envPath, options = {}) {
  const env = loadEnvFile(envPath);
  const config = options.configPath ? loadConfig(options.configPath) : {};
  const tagsConfig = config.tags || options.tags || {};

  if (Object.keys(tagsConfig).length === 0) {
    return { output: 'No tags configured. Add a `tags` section to your envdiff config.', keys: [] };
  }

  const tagMap = buildTagMap(env, tagsConfig);
  const filterTags = options.filterTags || [];
  const output = formatTagReport(env, tagMap, filterTags);
  const keys = filterTags.length ? filterByTags(tagMap, filterTags) : Object.keys(env);

  return { output, keys, tagMap: serializeTagMap(tagMap) };
}

module.exports = { formatTagReport, runTag };
