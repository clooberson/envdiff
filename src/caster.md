# caster

Casts raw string values from `.env` files into their natural JavaScript types.

## Functions

### `castValue(value)`
Attempts to cast a single string value:
- `"true"` / `"false"` → `boolean`
- `"null"` → `null`
- `"undefined"` → `undefined`
- Numeric strings → `number`
- Everything else → original `string`

### `castEnv(env)`
Applies `castValue` to every value in an env object. Returns a new object.

```js
const { castEnv } = require('./caster');
const typed = castEnv({ PORT: '3000', DEBUG: 'true' });
// { PORT: 3000, DEBUG: true }
```

### `castDiff(env)`
Returns only the keys whose value would change type, with `{ original, casted, changed }` entries.

```js
const { castDiff } = require('./caster');
const diff = castDiff({ PORT: '3000', NAME: 'app' });
// { PORT: { original: '3000', casted: 3000, changed: true } }
```

### `buildCastSummary(env)`
Returns a count of how many values would be cast to each type:
```js
{ boolean: 1, number: 2, null: 0, undefined: 0, unchanged: 5 }
```

## CLI runner

See `cast-runner.js` for formatted output suitable for terminal display.
