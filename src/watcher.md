# watcher

Provides live file-watching for `.env` files so `envdiff` can automatically re-run comparisons whenever a watched file changes on disk.

## API

### `watchFiles(filePaths, options?)`

Begins watching each path in `filePaths` for `change` events.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `silent` | boolean | `false` | Suppress console output |
| `onDiff` | function | `null` | Called with `(diffResult, changedPath)` on each change |

Returns a handle object:

```js
const handle = watchFiles(['.env', '.env.production'], {
  onDiff(result, file) {
    console.log('changed:', file);
    console.log(formatReport(result));
  },
});

// later:
handle.stop();
```

### `debounce(fn, delay?)`

Returns a debounced version of `fn`. Useful when wrapping `onDiff` to avoid rapid repeated calls during a file save.

```js
const onDiff = debounce((result) => console.log(formatReport(result)), 300);
watchFiles(['.env'], { onDiff });
```

## Notes

- Uses Node's built-in `fs.watch`; behaviour may vary across operating systems.
- Files that do not exist at watch-start are skipped with a warning rather than throwing.
- Combine with `--watch` CLI flag (planned) to enable interactive mode.
