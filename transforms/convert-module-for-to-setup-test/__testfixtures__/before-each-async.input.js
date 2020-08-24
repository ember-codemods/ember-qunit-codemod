import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true,
  async beforeEach() {
    await doStuff();
  },
});

test('it happens', function() {
  this.render(hbs`derp`);
});
