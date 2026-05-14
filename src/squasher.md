# squasher

Collapses multiple env objects into a single flat env map, with configurable conflict resolution.

## Functions

### `squashEnvs(envs, strategy)`

Merges an array of env objects into one. When the same key appears in multiple envs with different values, the `strategy` determines which value wins.

| Strategy | Behaviour |
|----------|-----------|
| `last`   | Last occurrence wins (default) |
| `first`  | First occurrence wins |
| `error`  | Throws on any conflicting key |

```js
const { squashEnvs } = require('./squasher');
const result = squashEnvs([envA, envB, envC], 'last');
```

### `findSquashConflicts(envs)`

Returns an array of key names that have differing values across the provided env objects.

```js
const conflicts = findSquashConflicts([envA, envB]);
// ['DB_HOST', 'API_KEY']
```

### `buildSquashSummary(envs, result, strategy)`

Returns a summary object describing the squash operation.

```js
{
  inputCount: 3,
  outputKeys: 12,
  conflictKeys: ['DB_HOST'],
  conflictCount: 1,
  strategy: 'last'
}
```

## CLI runner

See `squash-runner.js` for the `runSquash(filePaths, opts)` helper used by the CLI.

```js
const { runSquash } = require('./squash-runner');
const { result, report } = runSquash(['.env.staging', '.env.local'], { strategy: 'last', output: '.env.squashed' });
console.log(report);
```
