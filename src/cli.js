#!/usr/bin/env node
/**
 * cli.js — Command-line interface for envdiff
 */

const path = require('path');
const fs = require('fs');
const { diffFiles } = require('./index');
const { formatReport } = require('./reporter');
const { exportReport } = require('./exporter');
const { loadConfig } = require('./config');

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
Usage: envdiff <file1> <file2> [options]

Options:
  --format <json|csv|markdown>   Export format (default: terminal)
  --output <file>                Write output to file instead of stdout
  --config <file>                Path to envdiff config file
  --help                         Show this help message
`);
}

function parseArgs(argv) {
  const opts = { files: [], format: null, output: null, config: null };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help') { printUsage(); process.exit(0); }
    else if (arg === '--format') { opts.format = argv[++i]; }
    else if (arg === '--output') { opts.output = argv[++i]; }
    else if (arg === '--config') { opts.config = argv[++i]; }
    else if (!arg.startsWith('--')) { opts.files.push(arg); }
    i++;
  }
  return opts;
}

async function main() {
  const opts = parseArgs(args);

  if (opts.files.length < 2) {
    console.error('Error: at least two .env files are required.');
    printUsage();
    process.exit(1);
  }

  const config = opts.config ? loadConfig(opts.config) : {};
  const report = await diffFiles(opts.files, config);

  let output;
  if (opts.format) {
    output = exportReport(report, opts.format);
  } else {
    output = formatReport(report);
  }

  if (opts.output) {
    fs.writeFileSync(path.resolve(opts.output), output + '\n', 'utf8');
    console.log(`Output written to ${opts.output}`);
  } else {
    console.log(output);
  }

  const hasMissing = Object.values(report).some(v => v.status === 'missing');
  process.exit(hasMissing ? 1 : 0);
}

main().catch(err => {
  console.error('envdiff error:', err.message);
  process.exit(2);
});
