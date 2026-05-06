# patcher

Applies a diff between two `.env` files to produce a patched output.

## Modules

### `patcher.js`

Core patching logic — no file I/O.

#### `applyPatch(base, diff, source) → Object`

Merges missing and mismatched keys from `source` into a copy of `base`.

- `base` — the env to be patched
- `diff` — result from `compareEnvs` containing `missingInBase` and `mismatched` arrays
- `source` — the env to pull new/updated values from

Returns a new object; does not mutate `base`.

#### `serializeEnv(env) → string`

Converts an env object back to `.env` file format. Values containing spaces or `#` are wrapped in double quotes.

#### `patchSummary(diff) → Object`

Returns `{ added, updated, total }` counts from a diff result.

---

### `patch-runner.js`

High-level runner used by the CLI.

#### `runPatch(baseFile, sourceFile, outputFile?) → { summary, content }`

Loads both files, computes the diff, applies the patch, and optionally writes the result to disk.

#### `formatPatchSummary(summary) → string`

Returns a human-readable description of what the patch changed.

## Example

```js
const { runPatch, formatPatchSummary } = require('./patch-runner');

const { summary, content } = runPatch('.env', '.env.production', '.env.patched');
console.log(formatPatchSummary(summary));
// Patch applied: 2 key(s) added, 1 key(s) updated.
```
