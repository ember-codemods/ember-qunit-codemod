import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('stuff:here', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.customFunction = function() {
      return stuff();
    };
  });

  test('users customFunction', function(assert) {
    let custom = this.customFunction();
  });
});

module('stuff:here', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.customFunction = function() {
      return stuff();
    };

    this.otherThing = function(basedOn) {
      return this.blah(basedOn);
    };
  });

  test('can have two', function(assert) {
    let custom = this.customFunction();
    let other = this.otherThing();
  });
});
