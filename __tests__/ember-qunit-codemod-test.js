'use strict';

const fs = require('fs');

const defineTest = require('jscodeshift/dist/testUtils').defineTest;
const fixtureFolder = `${__dirname}/../__testfixtures__/ember-qunit-codemod`;

fs
  .readdirSync(fixtureFolder)
  .filter(filename => /\.input\.js$/.test(filename))
  .forEach(filename => {
    defineTest(
      __dirname,
      'ember-qunit-codemod',
      {},
      `ember-qunit-codemod/${filename.replace(/\.input\.js$/, '')}`
    );
  });
