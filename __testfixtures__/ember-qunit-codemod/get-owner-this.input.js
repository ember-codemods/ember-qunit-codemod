import { moduleFor, test } from 'ember-qunit';

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true
});

test('can fix getOwner(this) usage in a test', function (assert) {
  let owner = getOwner(this);
});

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true,
  beforeEach() {
    let owner = getOwner(this);
  }
});

test('can use getOwner(this) in beforeEach', function (assert) {
  // stuff
});

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true
});

test('can use Ember.getOwner(this) also', function (assert) {
  let owner = Ember.getOwner(this);
});
