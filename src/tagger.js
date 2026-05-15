// tagger.js — tag env keys with arbitrary labels and query by tag

/**
 * Build a tag map from a tags config object: { tagName: [keyPattern, ...] }
 * Returns Map<key, Set<tag>>
 */
function buildTagMap(env, tagsConfig) {
  const map = new Map();
  for (const key of Object.keys(env)) {
    map.set(key, new Set());
  }
  for (const [tag, patterns] of Object.entries(tagsConfig)) {
    for (const pattern of patterns) {
      const re = new RegExp(pattern);
      for (const key of Object.keys(env)) {
        if (re.test(key)) {
          map.get(key).add(tag);
        }
      }
    }
  }
  return map;
}

/**
 * Return only keys that have ALL of the given tags.
 */
function filterByTags(tagMap, tags) {
  const result = [];
  for (const [key, keyTags] of tagMap.entries()) {
    if (tags.every(t => keyTags.has(t))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Return a plain object mapping key -> sorted tag array.
 */
function serializeTagMap(tagMap) {
  const out = {};
  for (const [key, tags] of tagMap.entries()) {
    out[key] = [...tags].sort();
  }
  return out;
}

/**
 * Annotate a diff row array with tags from the tag map.
 * Each row gains a `tags` property (array of tags for that key).
 */
function tagDiffRows(rows, tagMap) {
  return rows.map(row => ({
    ...row,
    tags: row.key && tagMap.has(row.key) ? [...tagMap.get(row.key)].sort() : []
  }));
}

module.exports = { buildTagMap, filterByTags, serializeTagMap, tagDiffRows };
