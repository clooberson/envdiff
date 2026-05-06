# linter

Style and correctness checks for `.env` file contents.

## Functions

### `lintKey(key)`

Checks that a key follows `UPPER_SNAKE_CASE` convention.

- Returns `null` if the key is valid.
- Returns a descriptive string if the key is invalid.

### `lintValue(key, value)`

Checks a value for common issues:

- Leading or trailing whitespace
- Unquoted values containing `#` (which could be mistaken for inline comments)

Returns `null` if the value is clean, otherwise a descriptive string.

### `lintEnv(env)`

Runs `lintKey` and `lintValue` over every entry in a parsed env object.

```js
const { parseEnv } = require('./parser');
const { lintEnv } = require('./linter');

const env = parseEnv(rawText);
const issues = lintEnv(env);
// [ { key: 'bad_key', issue: 'key "bad_key" should be UPPER_SNAKE_CASE' }, ... ]
```

Returns an array of `{ key, issue }` objects.

### `isCleanLint(issues)`

Convenience helper — returns `true` when the issues array is empty.

## Integration

The linter works on plain objects produced by `parseEnv` from `src/parser.js`.
It is intentionally separate from validation (`src/validator.js`), which checks
value *semantics* (e.g. required fields, format rules). The linter only checks
*style*.
