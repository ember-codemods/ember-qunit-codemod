import { module, test } from 'qunit';
import { setupTest, setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';

const resolver = engineResolverFor('appointments-manager');

module('Integration | Component | Date picker', function(hooks) {
  setupRenderingTest(hooks, {
    resolver
  });

  test('renders text', async function(assert) {
    await render(hbs`{{date-picker}}`);
    assert.equal(this.$().text().trim(), 'una fecha');
  });
});

module('service:foo', function(hooks) {
  setupTest(hooks, {
    resolver
  });

  test('can resolve from custom resolver', function(assert) {
    assert.ok(this.owner.lookup('service:foo'));
  });
});

module('non-ember-qunit module', function(hooks) {
  hooks.beforeEach(function() {
    this.resolver = resolver;
  });

  test('custom resolver property means nothing, and ends up in `beforeEach`', function(assert) {
    assert.ok(this.owner.lookup('service:foo'));
  });
});
