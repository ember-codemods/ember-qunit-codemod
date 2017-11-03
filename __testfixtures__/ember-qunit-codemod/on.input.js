import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it happens', function(assert) {
  assert.expect(1);

  this.on('test', () => assert.ok(true));
  this.render(hbs`{{test-component test="test"}}`);
});

