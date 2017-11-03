import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from 'ember-test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it invokes a sendAction action', function(assert) {
    assert.expect(1);

    this.actions.test = () => assert.ok(true);
    this.render(hbs`{{test-component test="test"}}`);
  });
});

