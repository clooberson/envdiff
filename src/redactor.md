# redactor

Masks sensitive values in env diff output to prevent accidental exposure of secrets in reports or logs.

## Functions

### `isSensitiveKey(key, patterns?)`

Returns `true` if the given key matches any pattern in the provided (or default) list of sensitive patterns.

```js
isSensitiveKey('DB_PASSWORD'); // true
isSensitiveKey('PORT');        // false
```

### `redactEnv(env, patterns?)`

Accepts a parsed env object and returns a new object with sensitive values replaced by `'***'`.

```js
redactEnv({ PORT: '3000', DB_PASSWORD: 'secret' });
// => { PORT: '3000', DB_PASSWORD: '***' }
```

### `redactDiff(diffEntries, patterns?)`

Accepts an array of diff entries (as produced by `compareEnvs`) and returns a new array where sensitive entries have their values masked. Redacted entries are marked with `redacted: true`.

```js
redactDiff([
  { key: 'ACCESS_TOKEN', status: 'mismatch', values: { '.env': 'abc', '.env.prod': 'xyz' } }
]);
// => [{ key: 'ACCESS_TOKEN', status: 'mismatch', values: { '.env': '***', '.env.prod': '***' }, redacted: true }]
```

## Default Sensitive Patterns

| Pattern | Matches |
|---|---|
| `/password/i` | `DB_PASSWORD`, `password` |
| `/secret/i` | `APP_SECRET`, `secret_key` |
| `/token/i` | `ACCESS_TOKEN`, `token` |
| `/api[_-]?key/i` | `STRIPE_API_KEY`, `APIKEY` |
| `/private[_-]?key/i` | `PRIVATE_KEY` |
| `/auth/i` | `AUTH_TOKEN`, `OAUTH_SECRET` |
| `/credential/i` | `AWS_CREDENTIALS` |

Custom patterns can be passed as the second argument to any function.
