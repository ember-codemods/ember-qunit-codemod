#!/usr/bin/env node
'use strict';

const execa = require('execa');
const chalk = require('chalk');
const path = require('path');

try {
  let transformPath = path.join(__dirname, '/../ember-qunit-codemod.js');
  let targetDir = process.argv[2];
  execa('jscodeshift', ['-t', transformPath, targetDir], {
    stdio: 'inherit',
    env: process.env,
  });
} catch (e) {
  console.error(chalk.red(e.stack)); // eslint-disable-line no-console
  process.exit(-1);
}
