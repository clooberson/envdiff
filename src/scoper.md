# scoper

Scope-aware filtering and diffing of `.env` files based on key namespace prefixes.

## Concepts

A **scope** is the uppercase prefix before the first underscore in a key name.

```
DB_HOST   → scope: DB
APP_NAME  → scope: APP
SECRET    → no scope (ignored by scoper)
```

## API

### `scopeEnv(env, scope) → Object`

Returns only the key/value pairs whose keys start with `<scope>_`.

```js
scopeEnv({ DB_HOST: 'localhost', APP_NAME: 'x' }, 'DB')
// → { DB_HOST: 'localhost' }
```

### `stripScope(env, scope) → Object`

Like `scopeEnv`, but strips the prefix from the returned keys.

```js
stripScope({ DB_HOST: 'localhost' }, 'DB')
// → { HOST: 'localhost' }
```

### `listScopes(env) → string[]`

Returns a sorted list of all distinct scopes present in the env.

### `scopeDiff(envA, envB, scope) → Object`

Compares two envs restricted to a single scope. Returns:

```js
{
  scope: 'DB',
  only_a: ['DB_NAME'],   // keys present only in A
  only_b: ['DB_USER'],   // keys present only in B
  diff:   ['DB_HOST'],   // shared keys with different values
  shared: ['DB_HOST', 'DB_PORT']  // all shared keys
}
```

## CLI runner

See `scope-runner.js` for the `runScopeDiff(fileA, fileB, scope?)` helper
used by the CLI to produce human-readable scoped diff output.
