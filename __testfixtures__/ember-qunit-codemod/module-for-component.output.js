import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  test('it happens', function() {
    this.render(hbs`derp`);
  });
});
