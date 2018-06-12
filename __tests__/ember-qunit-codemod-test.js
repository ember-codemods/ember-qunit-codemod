'use strict';

const fs = require('fs');
const path = require('path');

const runInlineTest = require('jscodeshift/dist/testUtils').runInlineTest;
const EmberQUnitTransform = require('../ember-qunit-codemod');

const fixtureFolder = `${__dirname}/../__testfixtures__/ember-qunit-codemod`;

describe('ember-qunit-codemod', function() {
  fs.readdirSync(fixtureFolder)
    .filter(filename => /\.input\.[jt]s$/.test(filename))
    .forEach(filename => {
      let extension = path.extname(filename);
      let testName = filename.replace(`.input${extension}`, '');
      let inputPath = path.join(fixtureFolder, `${testName}.input${extension}`);
      let outputPath = path.join(fixtureFolder, `${testName}.output${extension}`);

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
