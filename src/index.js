import format from './formatter';

import glob from 'fast-glob';

import { lintFile } from './lint';

import { readFile } from 'fs';
import { promisify } from 'util';
const readFileAsync = promisify(readFile);

const rules = [
  tag => {
    if (tag.tagName !== 'include') return;
    // The include path is the part before the comma and/or whitespace, the params are the rest
    const includePath = tag.tagValue.split(/[\s,]+/)[0];
    if (includePath.startsWith("'") && includePath.endsWith("'")) return;
    return {
      ruleId: 'paths-should-be-quoted',
      message: 'Expected path to be quoted',
      source: tag.source,
      severity: 'error'
    };
  },
  tag => {
    // The path argument is the part before the comma and/or whitespace, the params are the rest
    const params = tag.tagValue.split(/[\s,]+/);
    // Params [1] is the first param after the path argument
    if (params[1] === 'with') {
      return {
        ruleId: 'no-with',
        message: 'Arguments should be comma-separated instead of using `with`',
        source: tag.source,
        severity: 'error'
      };
    }
  }
];

const main = async () => {
  const args = process.argv.slice(2);
  const userGlobs = args.filter(arg => !arg.startsWith('-'));
  const files = await glob(userGlobs.length > 0 ? userGlobs : ['**/*.liquid'], {
    ignore: ['**/node_modules/**/*']
  });
  const results = await Promise.all(
    files.map(async path => {
      const source = await readFileAsync(path, 'utf8');
      return lintFile(path, source, rules);
    })
  );
  const formatted = format(results);
  console.log(formatted);
  // Use a non-zero exit code if there is any output
  if (formatted !== '') process.exit(1); // eslint-disable-line unicorn/no-process-exit
};

main();
