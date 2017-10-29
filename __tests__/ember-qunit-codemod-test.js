'use strict';

const fs = require('fs');
const path = require('path');

const runInlineTest = require('jscodeshift/dist/testUtils').runInlineTest;
const EmberQUnitTransform = require('../ember-qunit-codemod');

const fixtureFolder = `${__dirname}/../__testfixtures__/ember-qunit-codemod`;

describe('ember-qunit-codemod', function() {
  fs
    .readdirSync(fixtureFolder)
    .filter(filename => /\.input\.js$/.test(filename))
    .forEach(filename => {
      let testName = filename.replace('.input.js', '');
      let inputPath = path.join(fixtureFolder, `${testName}.input.js`);
      let outputPath = path.join(fixtureFolder, `${testName}.output.js`);

      describe(testName, function() {
        it('transforms correctly', function() {
          runInlineTest(
            EmberQUnitTransform,
            {},
            { source: fs.readFileSync(inputPath, 'utf8') },
            fs.readFileSync(outputPath, 'utf8')
          );
        });

        it('is idempotent', function() {
          runInlineTest(
            EmberQUnitTransform,
            {},
            { source: fs.readFileSync(outputPath, 'utf8') },
            fs.readFileSync(outputPath, 'utf8')
          );
        });
      });
    });
});
