import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('something', function(hooks) {
  setupApplicationTest(hooks);

  test('uses global helpers', async function(assert) {
    await visit('/something');

    wait().then(() => assert.ok(true));
  });
});

