# differ-runner

High-level runner that wires together `differ`, `redactor`, and output formatting to produce a human-readable diff between two `.env` files.

## API

### `runDiffCommand(baseFile, compareFile, options?)`

Loads both files, runs the diff, optionally redacts sensitive values, prints results, and returns `{ rows, summary }`.

**Options:**

| Option    | Type    | Default | Description                              |
|-----------|---------|---------|------------------------------------------|
| `redact`  | boolean | `false` | Redact sensitive key values in output    |
| `noColor` | boolean | `false` | Disable ANSI color codes                 |
| `quiet`   | boolean | `false` | Suppress console output                  |

### `formatDiffRow(row, noColor?)`

Formats a single diff row as a padded string with status label and value info.

Status colors:
- `missing` → red
- `extra` → yellow
- `mismatch` → cyan
- `ok` → green

### `formatDiffSummary(summary)`

Returns a multi-line summary string from a `buildSummary` result object.

## Example

```js
const { runDiffCommand } = require('./differ-runner');

const { rows, summary } = runDiffCommand('.env.production', '.env.staging', {
  redact: true,
});
console.log('Total mismatches:', summary.mismatch);
```
