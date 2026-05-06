# scorer

Computes a numeric health/similarity score between two `.env` files.

## Functions

### `sharedKeyScore(a, b) → number`

Returns the percentage (0–100) of keys that appear in **both** maps relative to
the total union of keys.

```js
sharedKeyScore({ A: '1', B: '2' }, { A: '1', C: '3' });
// → 33  (1 shared out of 3 total)
```

### `valueMatchScore(a, b) → number`

Among keys that exist in both maps, returns the percentage whose **values are
identical**.

```js
valueMatchScore({ A: '1', B: 'x' }, { A: '1', B: 'y' });
// → 50
```

### `missingCount(a, b) → number`

Counts keys present in `a` but absent from `b`.

### `buildScore(a, b, labelA?, labelB?) → ScoreReport`

Builds a full score report:

| Field | Description |
|---|---|
| `overall` | Weighted score (60 % key coverage + 40 % value match) |
| `keyScore` | Result of `sharedKeyScore` |
| `valueMatchScore` | Result of `valueMatchScore` |
| `missingInB` | Keys in `a` missing from `b` |
| `missingInA` | Keys in `b` missing from `a` |
| `totalKeys` | Union of all keys |
| `labels` | `{ a, b }` display names |

## Usage

```js
const { buildScore } = require('./scorer');
const score = buildScore(devEnv, prodEnv, 'dev', 'prod');
console.log(`Overall health: ${score.overall}%`);
```
