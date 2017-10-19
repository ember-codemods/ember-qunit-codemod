import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function beforeEach() {
    doStuff();
  });

  test('it happens', function() {

  });
});

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.after(function after() {
    afterStuff();
  });

  test('it happens', function() {

  });
});

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  // Comments are preserved
  hooks.before(function derpy() {
    let foo = 'bar';
  });

  hooks.beforeEach(function beforeEach(assert) {
    assert.ok(true, 'lol');
  });

  hooks.afterEach(function afterEach() {
    herk = derp;
  });

  hooks.after(function after() {
    afterStuff();
  });

  test('it happens', function() {

  });
});
