# pinner

Pin current `.env` values as expected baselines and detect drift.

## API

### `pinEnv(env)`

Converts an env object into a pin map where each value is wrapped as `{ pinned: value }`. Useful for saving a snapshot of expected values.

```js
const { pinEnv } = require('./pinner');
const pin = pinEnv({ API_URL: 'https://api.example.com', PORT: '3000' });
// { API_URL: { pinned: 'https://api.example.com' }, PORT: { pinned: '3000' } }
```

### `checkPins(pinMap, liveEnv)`

Compares a live env against a previously created pin map. Returns an array of result objects sorted by key:

| Field    | Type      | Description                        |
|----------|-----------|------------------------------------|
| `key`    | string    | The env key                        |
| `pinned` | string    | The pinned (expected) value        |
| `actual` | string    | The current live value             |
| `status` | string    | `match`, `changed`, `missing`, `added` |

### `isPinClean(pinResults)`

Returns `true` if no keys are `changed` or `missing` (added keys are tolerated).

### `buildPinSummary(pinResults)`

Returns a summary object:

```js
{ total: 4, match: 2, changed: 1, missing: 0, added: 1, clean: false }
```

## Use case

Use `pinEnv` after a successful deployment to record known-good values, then use `checkPins` in CI to detect unexpected drift before the next deploy.
