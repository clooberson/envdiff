# grouper

Groups `.env` keys by their prefix (the part before the first `_` separator), making it easy to visualize namespaces across one or multiple environment files.

## Functions

### `extractPrefix(key, sep?)`

Returns the prefix of a key up to the first separator. Keys with no separator are placed in `__ungrouped__`.

```js
extractPrefix('DB_HOST')       // 'DB'
extractPrefix('PORT')          // '__ungrouped__'
extractPrefix('DB.HOST', '.')  // 'DB'
```

### `groupByPrefix(env, sep?)`

Groups a single env object by prefix.

```js
groupByPrefix({ DB_HOST: 'localhost', APP_NAME: 'x', PORT: '3000' })
// { DB: { DB_HOST: 'localhost' }, APP: { APP_NAME: 'x' }, __ungrouped__: { PORT: '3000' } }
```

### `groupKeysAcrossEnvs(envs, sep?)`

Merges and deduplicates keys from multiple env objects, grouped by prefix. Returns sorted arrays of key names per prefix.

```js
groupKeysAcrossEnvs([envDev, envProd])
// { DB: ['DB_HOST', 'DB_PASS', 'DB_PORT'], APP: ['APP_NAME'] }
```

### `buildGroupSummary(grouped)`

Returns a count of keys per prefix group. Works with output from either `groupByPrefix` or `groupKeysAcrossEnvs`.

## group-runner

The `runGroup(filePaths, options)` function in `group-runner.js` loads env files and runs the appropriate grouping function, returning formatted output and a summary object.

Options:
- `sep` — key separator character (default `_`)
- `cross` — force cross-env mode even for a single file
