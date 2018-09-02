# ember-qunit-codemod

This codemod is intended to automatically convert your projects from the older
`moduleFor*` syntax of `ember-qunit@2` to the newer syntax proposed by [emberjs/rfcs#232](https://github.com/emberjs/rfcs/blob/master/text/0232-simplify-qunit-testing-api.md).

This codemod can be used in conjunction with [ember-test-helpers-codemod](https://github.com/simonihmig/ember-test-helpers-codemod).

## Usage

To run a specific codemod from this project, you would run the following:

```
npx ember-qunit-codemod convert-module-for-to-setup-test path/of/files/ or/some**/*glob.js

# or

yarn global add ember-qunit-codemod
ember-qunit-codemod convert-module-for-to-setup-test path/of/files/ or/some**/*glob.js
```

## Transforms

<!--TRANSFORMS_START-->
* [convert-module-for-to-setup-test](transforms/convert-module-for-to-setup-test/README.md)
<!--TRANSFORMS_END-->

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `yarn`

### Running tests

* `yarn test`

### Update Documentation

* `yarn update-docs`

## Credit

ember-qunit-codemod is heavily inspired by the work done in [qunit-dom-codemod](https://github.com/simplabs/qunit-dom-codemod)
and [ember-mocha-codemods](https://github.com/Turbo87/ember-mocha-codemods)
largely by Tobias Bieniek. Thank you!
