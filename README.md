
ember-qunit-codemod
==============================================================================

This codemod is intended to automatically convert your projects from the older
`moduleFor*` syntax of `ember-qunit@2` to the newer syntax proposed by [emberjs/rfcs#232](https://github.com/emberjs/rfcs/blob/master/text/0232-simplify-qunit-testing-api.md).



Installation
------------------------------------------------------------------------------

`ember-qunit-codemods` itself doesn't need to be installed, but you need to
install [`jscodeshift`](https://github.com/facebook/jscodeshift) to run the
codemod script:

```
npm install -g jscodeshift
```


Usage
------------------------------------------------------------------------------

```
jscodeshift -t https://raw.githubusercontent.com/rwjblue/ember-qunit-codemod/master/ember-qunit-codemod.js PATH
```

Credit
------------------------------------------------------------------------------
ember-qunit-codemod is heavily inspired by the work done in [qunit-dom-codemod](https://github.com/simplabs/qunit-dom-codemod)
and [ember-mocha-codemods](https://github.com/Turbo87/ember-mocha-codemods)
largely by Tobias Bieniek. Thank you!

License
------------------------------------------------------------------------------

qunit-dom is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](https://github.com/simplabs/qunit-dom/blob/master/LICENSE.md).
