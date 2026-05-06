import path from 'path';
import { diffFiles } from './index.js';
import { formatReport } from './reporter.js';
import { exportReport } from './exporter.js';
import { watchFiles, debounce } from './watcher.js';

export function printUsage() {
  console.log(`
Usage: envdiff <file1> <file2> [fileN...] [options]

Options:
  --format <table|json|csv|md>  Output format (default: table)
  --export <path>               Write output to file
  --watch                       Re-run diff on file changes
  --silent                      Suppress non-error output
  --help                        Show this help message
`.trim());
}

export function parseArgs(argv = process.argv.slice(2)) {
  const files = [];
  const options = { format: 'table', export: null, watch: false, silent: false };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg === '--watch') {
      options.watch = true;
    } else if (arg === '--silent') {
      options.silent = true;
    } else if (arg === '--format' && argv[i + 1]) {
      options.format = argv[++i];
    } else if (arg === '--export' && argv[i + 1]) {
      options.export = argv[++i];
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
    i++;
  }

  return { files, options };
}

export async function run(argv) {
  const { files, options } = parseArgs(argv);

  if (files.length < 2) {
    printUsage();
    process.exit(1);
  }

  function runOnce() {
    const result = diffFiles(files);
    const report = formatReport(result, options.format);
    if (!options.silent) console.log(report);
    if (options.export) exportReport(result, options.export, options.format);
    return result;
  }

  if (options.watch) {
    runOnce();
    const onDiff = debounce((result, changed) => {
      if (!options.silent) console.log(`\n[envdiff] ${path.basename(changed)} changed\n`);
      const report = formatReport(result, options.format);
      if (!options.silent) console.log(report);
      if (options.export) exportReport(result, options.export, options.format);
    }, 300);
    watchFiles(files, { silent: options.silent, onDiff });
  } else {
    runOnce();
  }
}
