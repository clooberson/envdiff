# renamer

Rename keys across one or more env maps without mutating the originals.

## API

### `renameKey(env, oldKey, newKey)`

Returns a new env map with `oldKey` renamed to `newKey`. If `oldKey` does not
exist the map is returned as-is (still a copy).

```js
const { renameKey } = require('./renamer');
const next = renameKey({ DB_PASS: 'secret' }, 'DB_PASS', 'DATABASE_PASSWORD');
// { DATABASE_PASSWORD: 'secret' }
```

### `applyRenames(env, renames)`

Apply a rename map `{ oldKey: newKey, ... }` to a single env object.

```js
applyRenames(env, { OLD_HOST: 'DB_HOST', OLD_PORT: 'DB_PORT' });
```

### `renameAll(envs, renames)`

Apply the same rename map to every env in a `{ label: env }` object. Useful
when you need to normalise key names across dev / staging / production at once.

```js
const updated = renameAll({ dev, staging, prod }, { LEGACY_URL: 'API_URL' });
```

### `renameSummary(env, renames)`

Returns `{ renamed: string[], skipped: string[] }` describing which keys were
actually present (and therefore renamed) versus which were absent.

```js
const { renamed, skipped } = renameSummary(env, renames);
console.log(`Renamed ${renamed.length}, skipped ${skipped.length}`);
```

## Notes

- None of the functions mutate their inputs.
- Key order in the output follows insertion order; the renamed key occupies the
  same position as the original.
- If `oldKey === newKey` the map is returned unchanged (still a copy).
