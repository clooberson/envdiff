# deduper

Detects and resolves duplicate keys within a single `.env` file.

Most dotenv parsers silently apply last-write-wins when a key appears more than once. `deduper` makes that behaviour explicit and auditable.

## API

### `findDuplicateLines(raw: string): Record<string, number[]>`

Parses raw file content line-by-line and returns a map of every key that appears more than once, with the 1-based line numbers of each occurrence.

```js
const { findDuplicateLines } = require('./deduper');
const raw = fs.readFileSync('.env', 'utf8');
console.log(findDuplicateLines(raw));
// { DB_URL: [4, 17] }
```

### `duplicateKeys(env, dupMap): string[]`

Cross-references a parsed env object with the duplicate-lines map and returns the list of affected key names.

### `dedupeEnv(envMulti, strategy?): Record<string, string>`

Accepts a multi-value env map (`key -> string[]`) and collapses it to a single value per key.

| strategy | behaviour |
|----------|-----------|
| `'last'` (default) | keeps the last occurrence — matches standard dotenv behaviour |
| `'first'` | keeps the first occurrence |

### `buildDedupeSummary(dupMap): object`

Returns a structured summary:

```json
{
  "totalKeys": 1,
  "duplicateKeys": ["DB_URL"],
  "details": { "DB_URL": [4, 17] }
}
```

## Notes

- Comment lines (`# …`) and blank lines are ignored during scanning.
- `dedupeEnv` expects a pre-built multi-value map; pair it with a custom parser pass if you need it from raw text.
