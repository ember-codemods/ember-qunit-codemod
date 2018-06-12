const fs = require('fs');
const path = require('path');
const co = require('co');
const execa = require('execa');
const { createTempDir } = require('broccoli-test-helper');
const EXECUTABLE_PATH = path.join(__dirname, '..', 'bin', 'cli.js');
const FIXTURE_FOLDER = `${__dirname}/../__testfixtures__/ember-qunit-codemod`;
const { printExpected, printReceived } = require('jest-matcher-utils');
const diff = require('jest-diff');

expect.extend({
  toMatchFixture(fileName, actualFixture, expectedFixture) {
    let received = fs.readFileSync(actualFixture.path(fileName), 'utf8');
    let expected = fs.readFileSync(expectedFixture.path(fileName), 'utf8');

    const pass = received === expected;

    // message copied from toEqual implementation
    const message = () => {
      const diffString = diff(expected, received, { expand: this.expand });
      return (
        `Expected ${fileName} to equal:\n` +
        `  ${printExpected(expected)}\n` +
        `Received:\n` +
        `  ${printReceived(received)}` +
        (diffString ? `\n\nDifference:\n\n${diffString}` : '')
      );
    };
    // Passing the the actual and expected objects so that a custom reporter
    // could access them, for example in order to display a custom visual diff,
    // or create a different error message
    return { actual: received, expected, message, name: 'toMatchFixture', pass };
  },
});

describe('bin acceptance', function() {
  let input, output, files;

  function setupFixtures() {
    let inputFixture = { tests: {} };
    let outputFixture = { tests: {} };
    files = [];

    fs.readdirSync(FIXTURE_FOLDER)
      .filter(filename => /\.input\.[jt]s$/.test(filename))
      .forEach(filename => {
        let extension = path.extname(filename);
        let testName = filename.replace(`.input${extension}`, '');
        let inputPath = path.join(FIXTURE_FOLDER, `${testName}.input${extension}`);
        let outputPath = path.join(FIXTURE_FOLDER, `${testName}.output${extension}`);

        let simulatedFileName = testName + extension;
        inputFixture.tests[simulatedFileName] = fs.readFileSync(inputPath, 'utf8');
        outputFixture.tests[simulatedFileName] = fs.readFileSync(outputPath, 'utf8');
        files.push(`tests/${simulatedFileName}`);
      });

    input.write(inputFixture);
    output.write(outputFixture);
  }

  beforeEach(
    co.wrap(function*() {
      input = yield createTempDir();
      output = yield createTempDir();

      setupFixtures();
      expect.hasAssertions();
    })
  );

  afterEach(
    co.wrap(function*() {
      yield input.dispose();
      yield output.dispose();
    })
  );

  it(
    'works',
    co.wrap(function*() {
      let results = yield execa(EXECUTABLE_PATH, [input.path('tests')]);

      expect(results.code).toEqual(0);

      files.forEach(fileName => expect(fileName).toMatchFixture(input, output));
    }),
    60000
  );
});
