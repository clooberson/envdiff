# differ.js

High-level orchestration module that ties together parsing, comparison, sorting, and filtering into a single `runDiff` call.

## API

### `runDiff(baseContent, targetContent, options?)`

Runs a full diff between two raw `.env` file strings.

**Parameters**

| Name | Type | Description |
|---|---|---|
| `baseContent` | `string` | Raw text of the base `.env` file |
| `targetContent` | `string` | Raw text of the target `.env` file |
| `options.include` | `string[]` | If provided, only these keys are included in results |
| `options.exclude` | `string[]` | Keys to remove from results |
| `options.sorted` | `boolean` | Sort output alphabetically by key |

**Returns**

```js
{
  results: DiffEntry[],   // flat list of all diff entries
  grouped: object,        // entries grouped by status
  summary: {
    total: number,
    match: number,
    mismatch: number,
    missing: number,
    extra: number,
  }
}
```

### `buildSummary(grouped)`

Accepts a grouped result object (from `groupByStatus`) and returns a summary with per-status counts and a `total`.

### `flattenGrouped(grouped)`

Flattens a grouped result object back into a single array of `DiffEntry` items.

## Example

```js
const { runDiff } = require('./differ');
const fs = require('fs');

const base   = fs.readFileSync('.env.example', 'utf8');
const target = fs.readFileSync('.env.production', 'utf8');

const { results, summary } = runDiff(base, target, {
  exclude: ['LOCAL_ONLY'],
  sorted: true,
});

console.log(summary);
```
