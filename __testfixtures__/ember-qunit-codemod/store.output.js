import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Foo', function(hooks) {
  setupTest(hooks);

  test('uses store method', function (assert) {
    let store = this.owner.lookup('service:store');
  });
});
