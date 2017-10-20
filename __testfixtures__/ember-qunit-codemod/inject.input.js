import { moduleFor, test } from 'ember-qunit';
 
moduleFor('service:foo-bar', 'Unit | Service | FooBar', {
});

test('it exists', function(assert) {
  this.inject.service('foo');
  this.inject.service('foo', { as: 'bar' });
}); 
