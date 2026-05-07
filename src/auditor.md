# auditor

Static analysis and security audit for `.env` files.

## Functions

### `auditEmptyValues(env)`
Returns `warn`-level issues for any key whose value is empty, null, or undefined.

### `auditSensitiveDefaults(env)`
Detects sensitive keys (passwords, secrets, tokens) that appear to hold weak or default values such as `secret`, `changeme`, `password`, `123456`, etc. Returns `error`-level issues.

### `auditKeyFormat(env)`
Runs `lintKey` from the linter module against every key and surfaces `warn`-level issues for non-conforming names.

### `auditValueFormat(env)`
Runs `lintValue` from the linter module and returns `info`-level issues for suspicious value patterns (e.g. unbalanced quotes, embedded newlines).

### `auditEnv(env)`
Aggregates all four checks and returns a flat list of issues sorted by severity (errors first).

```js
const issues = auditEnv({ SECRET: 'changeme', PORT: '' });
// [
//   { key: 'SECRET', severity: 'error', code: 'WEAK_SECRET', message: '...' },
//   { key: 'PORT',   severity: 'warn',  code: 'EMPTY_VALUE', message: '...' },
// ]
```

### `buildAuditSummary(issues)`
Returns `{ total, counts: { error, warn, info }, clean }` from a list of issues.

## Severity levels

| Level | Meaning |
|-------|---------|
| `error` | Must fix — potential security risk |
| `warn`  | Should fix — quality or correctness concern |
| `info`  | Nice to fix — style or minor inconsistency |

## Related
- `src/linter.js` — key/value lint rules
- `src/redactor.js` — sensitive key detection
- `src/audit-runner.js` — CLI integration
