import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  test('can fix getOwner(this) usage in a test', function (assert) {
    let owner = this.owner;
  });
});

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    let owner = this.owner;
  });

  test('can use getOwner(this) in beforeEach', function (assert) {
    // stuff
  });
});

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  test('can use Ember.getOwner(this) also', function (assert) {
    let owner = this.owner;
  });
});
