import { moduleFor, test } from 'ember-qunit';

moduleFor('stuff:here', {
  customFunction() {
    return stuff();
  }
});

test('users customFunction', function(assert) {
  let custom = this.customFunction();
});

moduleFor('stuff:here', {
  customFunction() {
    return stuff();
  },

  otherThing(basedOn) {
    return this.blah(basedOn);
  }
});

test('can have two', function(assert) {
  let custom = this.customFunction();
  let other = this.otherThing();
});
