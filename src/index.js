#!/usr/bin/env node
const parse = require('./parser.js').parse;
const fileSystem = require('fs');

function readInput() {
  process.stdout.write('> ');
  return fileSystem.readFileSync(0, 'utf8');
}

function main() {
  if (process.argv.length > 2) {
    console.log(parse(process.argv[2]));
    process.exit(0);
  }
  let input = readInput();
  while (input) {
    console.log('\n' + parse(input));
    input = readInput();
  }
}

main();
