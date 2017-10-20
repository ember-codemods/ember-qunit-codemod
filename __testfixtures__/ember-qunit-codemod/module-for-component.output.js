import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  test('it happens', async function() {
    await this.render(hbs`derp`);
  });
});

module('Unit | Component | FooBar', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {
  });

  test('it happens again', function() {
  });
});

module('Unit | Component | FooBar', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {
  });

  test('it happens over and over', function() {
  });
});
