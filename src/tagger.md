# tagger

Tag env keys with arbitrary labels defined in your `envdiff` config, then filter or annotate output by those tags.

## Config

Add a `tags` block to your `envdiff.config.json`:

```json
{
  "tags": {
    "sensitive": ["_PASS$", "_SECRET$", "_KEY$"],
    "database":  ["^DB_"],
    "network":   ["^(PORT|HOST)$", "_HOST$", "_URL$"]
  }
}
```

Each tag maps to an array of regex patterns matched against key names.

## API

### `buildTagMap(env, tagsConfig) → Map<key, Set<tag>>`
Builds a map of every key in `env` to the set of tags whose patterns match it.

### `filterByTags(tagMap, tags) → string[]`
Returns keys that carry **all** of the specified tags (AND logic).

### `serializeTagMap(tagMap) → object`
Converts the `Map<key, Set>` to a plain `{ key: [tag, ...] }` object for JSON export.

### `tagDiffRows(rows, tagMap) → rows`
Annotates diff row objects with a `tags` array so downstream reporters can show tag info.

## CLI (tag-runner)

```js
const { runTag } = require('./tag-runner');
const result = runTag('.env', { tags: tagsConfig, filterTags: ['sensitive'] });
console.log(result.output);
```

## Notes
- Patterns are full `RegExp` strings; anchors (`^`, `$`) are recommended for precision.
- A key with no matching patterns receives an empty tag set — it still appears in unfiltered output.
