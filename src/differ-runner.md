# differ-runner

Runs a full diff between two or more `.env` files and formats the output for CLI display.

## Functions

### `formatDiffRow(row)`

Formats a single diff row object into a human-readable string with color coding based on status.

```js
formatDiffRow({ key: 'DB_HOST', status: 'missing', values: { a: 'localhost', b: undefined } })
// => '  DB_HOST   missing   localhost   -'
```

### `formatDiffSummary(summary)`

Formats the summary object returned by `buildSummary` into a compact status line.

```js
formatDiffSummary({ total: 10, matching: 7, missing: 2, mismatched: 1 })
// => '10 keys | 7 matching | 2 missing | 1 mismatched'
```

### `runDiffCommand(args)`

Entry point for the `diff` CLI subcommand. Accepts a parsed args object, loads and parses the specified env files, runs the diff, and prints the formatted report.

```js
await runDiffCommand({ files: ['.env', '.env.production'], format: 'table' })
```

## Options

| Flag | Description |
|------|-------------|
| `--format` | Output format: `table` (default), `json`, `csv`, `markdown` |
| `--only` | Comma-separated list of keys to include |
| `--exclude` | Comma-separated list of keys to exclude |
| `--no-color` | Disable ANSI color output |
