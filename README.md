# envdiff

> Utility to compare `.env` files across environments and flag missing or mismatched keys.

---

## Installation

```bash
npm install -g envdiff
```

---

## Usage

Compare two `.env` files and see what's missing or mismatched:

```bash
envdiff .env.example .env.production
```

**Example output:**

```
✔  DB_HOST         present in both
✗  API_KEY         missing in .env.production
⚠  LOG_LEVEL       value mismatch (development vs production)

2 issue(s) found.
```

You can also use it programmatically:

```js
const { compare } = require('envdiff');

const result = compare('.env.example', '.env.production');
console.log(result.missing);   // keys missing in target
console.log(result.mismatched); // keys with differing values
```

### Options

| Flag | Description |
|------|-------------|
| `--strict` | Exit with code 1 if any issues are found |
| `--json` | Output results as JSON |
| `--ignore <keys>` | Comma-separated list of keys to skip |

---

## License

[MIT](LICENSE)