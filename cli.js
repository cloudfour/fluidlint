#!/usr/bin/env node

const args = process.argv.slice(2);

if (args.includes('-v') || args.includes('--version')) {
  console.log(require('./package.json').version);
} else {
  require('./dist');
}
