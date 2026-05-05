#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const { diffFiles } = require('./index');
const { formatReport } = require('./reporter');
const { version } = require('../package.json');

program
  .name('envdiff')
  .description('Compare .env files across environments and flag missing or mismatched keys')
  .version(version);

program
  .command('diff <base> <compare>')
  .description('Diff two .env files')
  .option('-q, --quiet', 'suppress output, exit code only')
  .option('--no-color', 'disable colored output')
  .option('-f, --format <type>', 'output format: text or json', 'text')
  .action((base, compare, options) => {
    try {
      const result = diffFiles(base, compare);
      if (!options.quiet) {
        if (options.format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const report = formatReport(result, { color: options.color });
          console.log(report);
        }
      }
      const hasIssues = result.missing.length > 0 || result.mismatched.length > 0;
      process.exit(hasIssues ? 1 : 0);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
  });

program
  .command('check <base> [others...]')
  .description('Check one or more .env files against a base')
  .option('--no-color', 'disable colored output')
  .option('-f, --format <type>', 'output format: text or json', 'text')
  .action((base, others, options) => {
    let hasIssues = false;
    for (const other of others) {
      try {
        const result = diffFiles(base, other);
        if (options.format === 'json') {
          console.log(JSON.stringify({ file: other, ...result }, null, 2));
        } else {
          const report = formatReport(result, { color: options.color, label: other });
          console.log(report);
        }
        if (result.missing.length > 0 || result.mismatched.length > 0) hasIssues = true;
      } catch (err) {
        console.error(`Error processing ${other}: ${err.message}`);
        hasIssues = true;
      }
    }
    process.exit(hasIssues ? 1 : 0);
  });

program.parse(process.argv);
