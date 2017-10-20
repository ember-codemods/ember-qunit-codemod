import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it happens', function() {
  this.render(hbs`derp`);
});

moduleForComponent('foo-bar', 'Unit | Component | FooBar', {
  needs: [],
});

test('it happens', function() {
});

test('it happens again', function() {
});

moduleForComponent('foo-bar', 'Unit | Component | FooBar', {
  unit: true,
});

test('it happens', function() {
});

test('it happens over and over', function() {
});
