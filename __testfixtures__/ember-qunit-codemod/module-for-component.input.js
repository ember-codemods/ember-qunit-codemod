import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it happens', function() {
  this.render(hbs`derp`);
});
