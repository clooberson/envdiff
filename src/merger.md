# Merger Module

The `merger.js` module provides utilities for merging multiple `.env` files into a single unified environment map, with conflict tracking.

## API

### `mergeEnvs(base, override, options?)`

Merges two parsed env objects. The `override` values win by default.

**Options:**
- `strict` *(boolean, default `false`)* — When `true`, conflicting keys keep the `base` value instead of being overwritten.

**Returns:** `{ merged, conflicts }`
- `merged` — The resulting env object.
- `conflicts` — Array of `{ key, baseValue, overrideValue }` for every key that differed.

```js
const { mergeEnvs } = require('./merger');
const { merged, conflicts } = mergeEnvs({ A: '1' }, { A: '2', B: '3' });
// merged => { A: '2', B: '3' }
// conflicts => [{ key: 'A', baseValue: '1', overrideValue: '2' }]
```

### `mergeAll(envList, options?)`

Merges an ordered array of env objects sequentially. Accepts the same options as `mergeEnvs`.

```js
const { mergeAll } = require('./merger');
const { merged, conflicts } = mergeAll([envBase, envStaging, envLocal]);
```

### `hasConflicts(conflicts)`

Convenience helper — returns `true` if the conflicts array is non-empty.

```js
if (hasConflicts(conflicts)) {
  console.warn('Merge produced conflicts!');
}
```

## Integration

Use `mergeAll` together with `parseEnv` from `parser.js` and `compareEnvs` from `comparator.js` to build a full multi-environment diff pipeline.
