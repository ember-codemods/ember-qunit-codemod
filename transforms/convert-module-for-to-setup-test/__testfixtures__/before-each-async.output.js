import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await doStuff();
  });

  test('it happens', async function() {
    await render(hbs`derp`);
  });
});
