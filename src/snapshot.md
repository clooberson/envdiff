# snapshot

Save and compare env snapshots over time to detect drift between deployments or environment changes.

## Functions

### `saveSnapshot(env, snapshotPath)`

Serializes a parsed env object to a JSON file at the given path, including a timestamp.

```js
const { saveSnapshot } = require('./snapshot');
saveSnapshot({ DB_HOST: 'localhost', PORT: '3000' }, '.env.snapshot.json');
```

### `loadSnapshot(snapshotPath)`

Reads and parses a previously saved snapshot file. Throws if the file does not exist.

```js
const { loadSnapshot } = require('./snapshot');
const { env, timestamp } = loadSnapshot('.env.snapshot.json');
```

### `diffSnapshot(current, snapshotEnv)`

Compares a current env object against a snapshot's env, returning three arrays:

- `added` — keys present in current but not in the snapshot
- `removed` — keys present in the snapshot but not in current
- `changed` — keys present in both but with different values

```js
const { diffSnapshot } = require('./snapshot');
const { added, removed, changed } = diffSnapshot(currentEnv, snapshot.env);
```

### `defaultSnapshotPath(envFilePath)`

Derives a conventional snapshot file path adjacent to the source env file.

```js
defaultSnapshotPath('/project/.env.staging');
// => '/project/..env.staging.snapshot.json'
```

## Typical workflow

1. After a deploy, call `saveSnapshot` to record the current state.
2. On the next run, `loadSnapshot` + `diffSnapshot` to see what changed.
3. Pipe results into `formatReport` or `exportReport` for visibility.
