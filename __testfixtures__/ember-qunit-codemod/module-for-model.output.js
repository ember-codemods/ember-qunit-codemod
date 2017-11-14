import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | foo', function(hooks) {
  setupTest(hooks);

  test('It transforms the subject', function (assert) {
    let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
  });

});