# interpolator

Handles variable interpolation in `.env` file values, allowing one variable to reference another.

## Supported Syntax

- `${VAR_NAME}` — braced reference (recommended)
- `$VAR_NAME` — unbraced reference (uppercase + underscores only)

## Functions

### `interpolateValue(value, context)`

Expands all variable references in a single string value using the provided context map.

```js
interpolateValue('${HOST}:${PORT}', { HOST: 'localhost', PORT: '3000' });
// => 'localhost:3000'
```

Missing keys resolve to an empty string.

---

### `interpolateEnv(env)`

Expands all values in an env map, using the same map as the interpolation context.

```js
interpolateEnv({ BASE: '/app', LOG: '${BASE}/logs' });
// => { BASE: '/app', LOG: '/app/logs' }
```

> Note: circular references are not detected and will produce empty expansions.

---

### `findUnresolvedRefs(env)`

Scans all values for variable references that point to keys not present in the env.

Returns an array of `{ key, refs[] }` objects.

```js
findUnresolvedRefs({ URL: '${PROTO}://example.com' });
// => [{ key: 'URL', refs: ['PROTO'] }]
```

## Usage via CLI runner

See `interpolate-runner.js` for the CLI-facing wrapper that loads a file and prints a report.
