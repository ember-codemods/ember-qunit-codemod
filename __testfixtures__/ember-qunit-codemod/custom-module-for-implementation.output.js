import moduleForComponent from '../helpers/module-for-component';
import { test } from 'qunit';

moduleForOtherComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it does not get changed', function() {
  this.render(hbs`derp`);
});

