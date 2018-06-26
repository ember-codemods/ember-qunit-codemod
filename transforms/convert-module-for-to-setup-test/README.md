# main

This codemod transforms from the `moduleFor*` style system to `setup*Test` system.

## Usage

```
npx ember-qunit-codemod convert-module-for-to-setup-test path/of/files/ or/some**/*glob.js

# or

yarn global add ember-qunit-codemod
ember-qunit-codemod convert-module-for-to-setup-test path/of/files/ or/some**/*glob.js
```

## Input / Output

<!--FIXTURES_TOC_START-->
* [basic-typescript-support](#basic-typescript-support)
* [custom-functions-in-options](#custom-functions-in-options)
* [custom-module-for-implementation](#custom-module-for-implementation)
* [get-owner-this](#get-owner-this)
* [global-wait](#global-wait)
* [inject](#inject)
* [lookup](#lookup)
* [merge-qunit-imports](#merge-qunit-imports)
* [module-for-acceptance](#module-for-acceptance)
* [module-for-arg-combos](#module-for-arg-combos)
* [module-for-component](#module-for-component)
* [module-for-model](#module-for-model)
* [module-for-with-lifecycle-callbacks](#module-for-with-lifecycle-callbacks)
* [module-with-long-name](#module-with-long-name)
* [multi-module-for](#multi-module-for)
* [native-qunit-to-nested](#native-qunit-to-nested)
* [nested-module-with-arrow](#nested-module-with-arrow)
* [non-module-ember-qunit-imports](#non-module-ember-qunit-imports)
* [non-module-render-usage](#non-module-render-usage)
* [on](#on)
* [register](#register)
* [remove-empty-import](#remove-empty-import)
* [resolver](#resolver)
* [rewrite-imports](#rewrite-imports)
* [simple-module-for](#simple-module-for)
* [subject](#subject)
* [test-skip-imports](#test-skip-imports)
* [wait](#wait)
<!--FIXTURES_TOC_END-->

<!--FIXTURES_CONTENT_START-->
---
<a id="basic-typescript-support">**basic-typescript-support}**</a>

**Input** (<small>[basic-typescript-support.input.ts](transforms/convert-module-for-to-setup-test/__testfixtures__/basic-typescript-support.input.ts)</small>):
```ts
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true
});

test('should allow messages to be queued', function (assert) {
  let subject = this.subject();
});


```

**Output** (<small>[basic-typescript-support.input.ts](transforms/convert-module-for-to-setup-test/__testfixtures__/basic-typescript-support.output.ts)</small>):
```ts
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  test('should allow messages to be queued', function (assert) {
    let subject = this.owner.lookup('service:flash');
  });
});


```
---
<a id="custom-functions-in-options">**custom-functions-in-options}**</a>

**Input** (<small>[custom-functions-in-options.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/custom-functions-in-options.input.js)</small>):
```js
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

moduleFor('foo:bar', {
  m3: true,
});

test('can access', function(assert) {
  let usesM3 = this.m3;
});

moduleFor('foo:bar', {
  m3: true,

  beforeEach() {
    doStuff();
  },
});

test('separate `hooks.beforeEach` than lifecycle hooks', function(assert) {
  let usesM3 = this.m3;
});

```

**Output** (<small>[custom-functions-in-options.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/custom-functions-in-options.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('stuff:here', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.customFunction = function() {
      return stuff();
    };
  });

  test('users customFunction', function(assert) {
    let custom = this.customFunction();
  });
});

module('stuff:here', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.customFunction = function() {
      return stuff();
    };

    this.otherThing = function(basedOn) {
      return this.blah(basedOn);
    };
  });

  test('can have two', function(assert) {
    let custom = this.customFunction();
    let other = this.otherThing();
  });
});

module('foo:bar', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.m3 = true;
  });

  test('can access', function(assert) {
    let usesM3 = this.m3;
  });
});

module('foo:bar', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.m3 = true;
  });

  hooks.beforeEach(function() {
    doStuff();
  });

  test('separate `hooks.beforeEach` than lifecycle hooks', function(assert) {
    let usesM3 = this.m3;
  });
});

```
---
<a id="custom-module-for-implementation">**custom-module-for-implementation}**</a>

**Input** (<small>[custom-module-for-implementation.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/custom-module-for-implementation.input.js)</small>):
```js
import moduleForComponent from '../helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForOtherComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it does not get changed', function() {
  this.render(hbs`derp`);
});


```

**Output** (<small>[custom-module-for-implementation.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/custom-module-for-implementation.output.js)</small>):
```js
import moduleForComponent from '../helpers/module-for-component';
import { test } from 'qunit';

moduleForOtherComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it does not get changed', function() {
  this.render(hbs`derp`);
});


```
---
<a id="get-owner-this">**get-owner-this}**</a>

**Input** (<small>[get-owner-this.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/get-owner-this.input.js)</small>):
```js
import Service from '@ember/service';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true
});

test('can fix getOwner(this) usage in a test', function (assert) {
  let owner = getOwner(this);
});

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true,
  beforeEach() {
    let owner = getOwner(this);
  }
});

test('can use getOwner(this) in beforeEach', function (assert) {
  // stuff
});

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true
});

test('can use Ember.getOwner(this) also', function (assert) {
  let owner = Ember.getOwner(this);
});

test('objects registered can continue to use `getOwner(this)`', function(assert) {
  this.register('service:foo', Service.extend({
    someMethod() {
      let owner = getOwner(this);
      return owner.lookup('other:thing').someMethod();
    }
  }));
});

moduleFor('service:flash', {
  beforeEach() {
    this.blah = getOwner(this).lookup('service:blah');
    this.register('service:foo', Service.extend({
      someMethod() {
        let owner = getOwner(this);
        return owner.lookup('other:thing').someMethod();
      }
    }));
  }
});

test('can use getOwner(this) in beforeEach for each context', function (assert) {
  // stuff
});

```

**Output** (<small>[get-owner-this.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/get-owner-this.output.js)</small>):
```js
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  test('can fix getOwner(this) usage in a test', function (assert) {
    let owner = this.owner;
  });
});

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    let owner = this.owner;
  });

  test('can use getOwner(this) in beforeEach', function (assert) {
    // stuff
  });
});

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  test('can use Ember.getOwner(this) also', function (assert) {
    let owner = this.owner;
  });

  test('objects registered can continue to use `getOwner(this)`', function(assert) {
    this.owner.register('service:foo', Service.extend({
      someMethod() {
        let owner = getOwner(this);
        return owner.lookup('other:thing').someMethod();
      }
    }));
  });
});

module('service:flash', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.blah = this.owner.lookup('service:blah');
    this.owner.register('service:foo', Service.extend({
      someMethod() {
        let owner = getOwner(this);
        return owner.lookup('other:thing').someMethod();
      }
    }));
  });

  test('can use getOwner(this) in beforeEach for each context', function (assert) {
    // stuff
  });
});

```
---
<a id="global-wait">**global-wait}**</a>

**Input** (<small>[global-wait.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/global-wait.input.js)</small>):
```js
import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('something');

test('uses global helpers', function(assert) {
  visit('/something');

  wait().then(() => assert.ok(true));
});

```

**Output** (<small>[global-wait.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/global-wait.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('something', function(hooks) {
  setupApplicationTest(hooks);

  test('uses global helpers', async function(assert) {
    await visit('/something');

    wait().then(() => assert.ok(true));
  });
});

```
---
<a id="inject">**inject}**</a>

**Input** (<small>[inject.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/inject.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';
 
moduleFor('service:foo-bar', 'Unit | Service | FooBar', {
});

test('it exists', function(assert) {
  this.inject.service('foo');
  this.inject.service('foo', { as: 'bar' });
}); 

test('it works for controllers', function(assert) {
  this.inject.controller('foo');
  this.inject.controller('foo', { as: 'bar' });
});

test('handles dasherized names', function(assert) {
  this.inject.service('foo-bar');
});

```

**Output** (<small>[inject.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/inject.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | FooBar', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    this.foo = this.owner.lookup('service:foo');
    this.bar = this.owner.lookup('service:foo');
  });

  test('it works for controllers', function(assert) {
    this.foo = this.owner.lookup('controller:foo');
    this.bar = this.owner.lookup('controller:foo');
  });

  test('handles dasherized names', function(assert) {
    this['foo-bar'] = this.owner.lookup('service:foo-bar');
  });
});

```
---
<a id="lookup">**lookup}**</a>

**Input** (<small>[lookup.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/lookup.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo', {
  beforeEach() {
    let service = this.container.lookup('service:thingy');
  }
});

test('it happens', function() {
  this.container.lookup('service:thingy').doSomething();
});

moduleFor('service:bar', 'Unit | Service | Bar');

test('it happens again?', function() {
  this.container.lookup('service:thingy').doSomething();
});

```

**Output** (<small>[lookup.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/lookup.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    let service = this.owner.lookup('service:thingy');
  });

  test('it happens', function() {
    this.owner.lookup('service:thingy').doSomething();
  });
});

module('Unit | Service | Bar', function(hooks) {
  setupTest(hooks);

  test('it happens again?', function() {
    this.owner.lookup('service:thingy').doSomething();
  });
});

```
---
<a id="merge-qunit-imports">**merge-qunit-imports}**</a>

**Input** (<small>[merge-qunit-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/merge-qunit-imports.input.js)</small>):
```js
import { skip } from 'qunit';
import { moduleFor, test } from 'ember-qunit';

```

**Output** (<small>[merge-qunit-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/merge-qunit-imports.output.js)</small>):
```js
import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

```
---
<a id="module-for-acceptance">**module-for-acceptance}**</a>

**Input** (<small>[module-for-acceptance.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-acceptance.input.js)</small>):
```js
import { test } from 'ember-qunit';
import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';
import { setupTestHelper } from 'setup-test-helper';

moduleForAcceptance('Acceptance | MyRoute', {
  beforeEach() {
    // my comment
    setupTestHelper();
  },
});

test('it happens', function() {
  visit('my-route');
  andThen(() => {
    assert.equal(currentURL(), 'wat');
  });
});

moduleForAcceptance('Acceptance | ES5 MyRoute', {
  beforeEach: function() {
    setupTestHelper();
  },
});

test('it happens with es5 function', function() {
  visit('my-route');
  andThen(() => {
    // visit me
    assert.equal(currentURL(), 'wat');
    assert.equal(currentURL(), 'wat');
    assert.equal(currentRouteName(), 'wat');
  });
});

moduleForAcceptance('Acceptance | OtherRoute', {
  beforeEach() {},
});

test('it happens with find', function() {
  visit('my-route');
  blur('#my-input');
  click('#my-block');
  find('#my-block');
  fillIn('#my-input', 'codemod');
  focus('#my-input');
  tap('#my-input');
  triggerEvent('#my-input', 'focusin');
  triggerKeyEvent('#my-input', 'keyup', 13);
});

moduleForAcceptance('Acceptance | AndThenRoute');

test('it works with andThen', function() {
  visit('my-route');
  andThen(() => {
    assert.ok(true);
    assert.ok(false);
  });
  find('#my-block');
});

test('it works with es5 andThen', function() {
  visit('my-route');
  andThen(function() {
    assert.ok(true);
    assert.ok(false);
  });
  find('#my-block');
});

test('it works with nested', function() {
  visit('my-route');
  andThen(function() {
    assert.equal(currenURL(), 'my-route');
    visit('other-route');
  });
  andThen(function() {
    assert.equal(currenURL(), 'other-route');
  });
});

test('it works with nested andThens', function() {
  visit('my-route');
  andThen(function() {
    assert.equal(currenURL(), 'my-route');
    visit('other-route');
    andThen(function() {
      assert.equal(currenURL(), 'other-route');
    });
  });
});

test('it works with assert.expect', function() {
  assert.expect(2);
  visit('my-route');
  andThen(function() {
    assert.equal(currenURL(), 'my-route');
    visit('other-route');
  });
  andThen(function() {
    assert.equal(currenURL(), 'other-route');
  });
});

module(
  'something',
  {
    beforeEach() {
      console.log('outer beforeEach');
    },
    afterEach() {
      console.log('outer afterEach');
    },
  },
  function() {
    moduleForAcceptance('nested', {
      beforeEach() {
        console.log('nested beforeEach');
      },
      afterEach() {
        console.log('nested afterEach');
      },
    });

    test('foo', function(assert) {
      assert.expect(2);
      visit('my-route');
      andThen(function() {
        assert.equal(currenURL(), 'my-route');
      });
    });
  }
);

module('other thing', function(hooks) {
  hooks.beforeEach(function() {
    console.log('outer beforeEach');
  });

  hooks.afterEach(function() {
    console.log('outer afterEach');
  });

  moduleForAcceptance('nested', {
    beforeEach() {
      console.log('nested beforeEach');
    },
    afterEach() {
      console.log('nested afterEach');
    },
  });

  test('foo', function(assert) {
    assert.expect(2);
    visit('my-route');
    andThen(function() {
      assert.equal(currenURL(), 'my-route');
    });
  });
});

```

**Output** (<small>[module-for-acceptance.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-acceptance.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupTestHelper } from 'setup-test-helper';

module('Acceptance | MyRoute', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    // my comment
    setupTestHelper();
  });

  test('it happens', async function() {
    await visit('my-route');
    assert.equal(currentURL(), 'wat');
  });
});

module('Acceptance | ES5 MyRoute', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    setupTestHelper();
  });

  test('it happens with es5 function', async function() {
    await visit('my-route');
    // visit me
    assert.equal(currentURL(), 'wat');
    assert.equal(currentURL(), 'wat');
    assert.equal(currentRouteName(), 'wat');
  });
});

module('Acceptance | OtherRoute', function(hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(function() {});

  test('it happens with find', async function() {
    await visit('my-route');
    await blur('#my-input');
    await click('#my-block');
    await find('#my-block');
    await fillIn('#my-input', 'codemod');
    await focus('#my-input');
    await tap('#my-input');
    await triggerEvent('#my-input', 'focusin');
    await triggerKeyEvent('#my-input', 'keyup', 13);
  });
});

module('Acceptance | AndThenRoute', function(hooks) {
  setupApplicationTest(hooks);

  test('it works with andThen', async function() {
    await visit('my-route');
    assert.ok(true);
    assert.ok(false);
    await find('#my-block');
  });

  test('it works with es5 andThen', async function() {
    await visit('my-route');
    assert.ok(true);
    assert.ok(false);
    await find('#my-block');
  });

  test('it works with nested', async function() {
    await visit('my-route');
    assert.equal(currenURL(), 'my-route');
    await visit('other-route');
    assert.equal(currenURL(), 'other-route');
  });

  test('it works with nested andThens', async function() {
    await visit('my-route');
    assert.equal(currenURL(), 'my-route');
    await visit('other-route');
    assert.equal(currenURL(), 'other-route');
  });

  test('it works with assert.expect', async function() {
    assert.expect(2);
    await visit('my-route');
    assert.equal(currenURL(), 'my-route');
    await visit('other-route');
    assert.equal(currenURL(), 'other-route');
  });
});

module('something', function(hooks) {
  hooks.beforeEach(function() {
    console.log('outer beforeEach');
  });

  hooks.afterEach(function() {
    console.log('outer afterEach');
  });

  module('nested', function(hooks) {
    setupApplicationTest(hooks);

    hooks.beforeEach(function() {
      console.log('nested beforeEach');
    });

    hooks.afterEach(function() {
      console.log('nested afterEach');
    });

    test('foo', async function(assert) {
      assert.expect(2);
      await visit('my-route');
      assert.equal(currenURL(), 'my-route');
    });
  });
});

module('other thing', function(hooks) {
  hooks.beforeEach(function() {
    console.log('outer beforeEach');
  });

  hooks.afterEach(function() {
    console.log('outer afterEach');
  });

  module('nested', function(hooks) {
    setupApplicationTest(hooks);

    hooks.beforeEach(function() {
      console.log('nested beforeEach');
    });

    hooks.afterEach(function() {
      console.log('nested afterEach');
    });

    test('foo', async function(assert) {
      assert.expect(2);
      await visit('my-route');
      assert.equal(currenURL(), 'my-route');
    });
  });
});

```
---
<a id="module-for-arg-combos">**module-for-arg-combos}**</a>

**Input** (<small>[module-for-arg-combos.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-arg-combos.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo');

test('it happens', function() {

});

moduleFor('service:foo');

test('it happens', function() {

});

moduleFor('service:foo', { integration: true });

test('it happens', function() {

});

```

**Output** (<small>[module-for-arg-combos.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-arg-combos.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {

  });
});

module('service:foo', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {

  });
});

module('service:foo', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {

  });
});

```
---
<a id="module-for-component">**module-for-component}**</a>

**Input** (<small>[module-for-component.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-component.input.js)</small>):
```js
import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true
});

test('it happens', function() {
  this.render(hbs`derp`);
});

test('it happens with comments', function(assert) {
  // comments above this.render are preserved
  this.render(hbs`derp`);

  assert.equal(this._element.textContent, 'derp');
});

test('multiple renders', function() {
  this.render(hbs`lololol`);

  assert.ok(this.$().text(), 'lololol');

  this.clearRender();
  this.render(hbs`other stuff`);

  assert.ok(this.$().text(), 'other stuff');
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

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true,

  beforeEach() {
    this.render(hbs`derp`);
  },
});

test('can make assertion', function (assert) {
  assert.equal(this._element.textContent, 'derp');
});

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true,

  foo() {
    this.render(hbs`derp`);
  },
});

test('can use render in custom method', function (assert) {
  return wait().then(() => {
    assert.equal(this._element.textContent, 'derp');
  });
});

```

**Output** (<small>[module-for-component.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-component.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import { clearRender, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  test('it happens', async function() {
    await render(hbs`derp`);
  });

  test('it happens with comments', async function(assert) {
    // comments above this.render are preserved
    await render(hbs`derp`);

    assert.equal(this.element.textContent, 'derp');
  });

  test('multiple renders', async function() {
    await render(hbs`lololol`);

    assert.ok(this.$().text(), 'lololol');

    await clearRender();
    await render(hbs`other stuff`);

    assert.ok(this.$().text(), 'other stuff');
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

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`derp`);
  });

  test('can make assertion', function (assert) {
    assert.equal(this.element.textContent, 'derp');
  });
});

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.foo = async function() {
      await render(hbs`derp`);
    };
  });

  test('can use render in custom method', function (assert) {
    return settled().then(() => {
      assert.equal(this.element.textContent, 'derp');
    });
  });
});

```
---
<a id="module-for-model">**module-for-model}**</a>

**Input** (<small>[module-for-model.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-model.input.js)</small>):
```js
import {moduleForModel, test} from 'ember-qunit';

moduleForModel('foo', 'Unit | Model | foo');

test('It transforms the subject', function(assert) {
  const model = this.subject();
});

moduleForModel('foo', 'Unit | Model | Foo', {
  needs: ['serializer:foo']
});

test('uses store method', function (assert) {
  let store = this.store();
});

```

**Output** (<small>[module-for-model.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-model.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | foo', function(hooks) {
  setupTest(hooks);

  test('It transforms the subject', function(assert) {
    const model = run(() => this.owner.lookup('service:store').createRecord('foo'));
  });
});

module('Unit | Model | Foo', function(hooks) {
  setupTest(hooks);

  test('uses store method', function (assert) {
    let store = this.owner.lookup('service:store');
  });
});

```
---
<a id="module-for-with-lifecycle-callbacks">**module-for-with-lifecycle-callbacks}**</a>

**Input** (<small>[module-for-with-lifecycle-callbacks.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-with-lifecycle-callbacks.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo', {
  beforeEach() {
    doStuff();
  }
});

test('it happens', function() {

});

moduleFor('service:foo', 'Unit | Service | Foo', {
  after() {
    afterStuff();
  }
});

test('it happens', function() {

});

moduleFor('service:foo', 'Unit | Service | Foo', {
  // Comments are preserved
  before: function derpy() {
    let foo = 'bar';
  },

  beforeEach(assert) {
    assert.ok(true, 'lol');
  },

  afterEach() {
    herk = derp;
  },

  after() {
    afterStuff();
  }
});

test('it happens', function() {

});

```

**Output** (<small>[module-for-with-lifecycle-callbacks.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-for-with-lifecycle-callbacks.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    doStuff();
  });

  test('it happens', function() {

  });
});

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.after(function() {
    afterStuff();
  });

  test('it happens', function() {

  });
});

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  // Comments are preserved
  hooks.before(function derpy() {
    let foo = 'bar';
  });

  hooks.beforeEach(function(assert) {
    assert.ok(true, 'lol');
  });

  hooks.afterEach(function() {
    herk = derp;
  });

  hooks.after(function() {
    afterStuff();
  });

  test('it happens', function() {

  });
});

```
---
<a id="module-with-long-name">**module-with-long-name}**</a>

**Input** (<small>[module-with-long-name.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-with-long-name.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo with a very long name that would cause line breaks');

test('it happens', function() {

});

```

**Output** (<small>[module-with-long-name.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/module-with-long-name.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo with a very long name that would cause line breaks', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {

  });
});

```
---
<a id="multi-module-for">**multi-module-for}**</a>

**Input** (<small>[multi-module-for.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/multi-module-for.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo');

test('it happens', function() {

});

moduleFor('service:foo', 'Unit | Service | Foo');

test('it happens again?', function() {

});

```

**Output** (<small>[multi-module-for.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/multi-module-for.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {

  });
});

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  test('it happens again?', function() {

  });
});

```
---
<a id="native-qunit-to-nested">**native-qunit-to-nested}**</a>

**Input** (<small>[native-qunit-to-nested.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/native-qunit-to-nested.input.js)</small>):
```js
import { abs } from 'dummy/helpers/abs';
import { module, test } from 'qunit';

module('Unit | Helper | abs');

test('absolute value works', function(assert) {
  let result;
  result = abs([-1]);
  assert.equal(result, 1);
  result = abs([1]);
  assert.equal(result, 1);
});

```

**Output** (<small>[native-qunit-to-nested.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/native-qunit-to-nested.output.js)</small>):
```js
import { abs } from 'dummy/helpers/abs';
import { module, test } from 'qunit';

module('Unit | Helper | abs', function() {
  test('absolute value works', function(assert) {
    let result;
    result = abs([-1]);
    assert.equal(result, 1);
    result = abs([1]);
    assert.equal(result, 1);
  });
});

```
---
<a id="nested-module-with-arrow">**nested-module-with-arrow}**</a>

**Input** (<small>[nested-module-with-arrow.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/nested-module-with-arrow.input.js)</small>):
```js
import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import { clearRender, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', hooks => {
  setupRenderingTest(hooks);

  test('it happens', async function() {
    await render(hbs`derp`);
  });

  test('it happens with comments', async function(assert) {
    // comments above this.render are preserved
    await render(hbs`derp`);

    assert.equal(this.element.textContent, 'derp');
  });

  test('multiple renders', async function() {
    await render(hbs`lololol`);

    assert.ok(this.$().text(), 'lololol');

    await clearRender();
    await render(hbs`other stuff`);

    assert.ok(this.$().text(), 'other stuff');
  });
});

```

**Output** (<small>[nested-module-with-arrow.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/nested-module-with-arrow.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import { clearRender, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', hooks => {
  setupRenderingTest(hooks);

  test('it happens', async function() {
    await render(hbs`derp`);
  });

  test('it happens with comments', async function(assert) {
    // comments above this.render are preserved
    await render(hbs`derp`);

    assert.equal(this.element.textContent, 'derp');
  });

  test('multiple renders', async function() {
    await render(hbs`lololol`);

    assert.ok(this.$().text(), 'lololol');

    await clearRender();
    await render(hbs`other stuff`);

    assert.ok(this.$().text(), 'other stuff');
  });
});

```
---
<a id="non-module-ember-qunit-imports">**non-module-ember-qunit-imports}**</a>

**Input** (<small>[non-module-ember-qunit-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/non-module-ember-qunit-imports.input.js)</small>):
```js
import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';

setResolver(resolver);
start();

```

**Output** (<small>[non-module-ember-qunit-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/non-module-ember-qunit-imports.output.js)</small>):
```js
import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';

setResolver(resolver);
start();

```
---
<a id="non-module-render-usage">**non-module-render-usage}**</a>

**Input** (<small>[non-module-render-usage.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/non-module-render-usage.input.js)</small>):
```js
import someOtherThing from '../foo-bar/';

// this example doesn't use this.render inside of a test block, so it should not be transformed
// and there should be no new imports added
someOtherThing(function() {
  this.render('derp');
});
```

**Output** (<small>[non-module-render-usage.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/non-module-render-usage.output.js)</small>):
```js
import someOtherThing from '../foo-bar/';

// this example doesn't use this.render inside of a test block, so it should not be transformed
// and there should be no new imports added
someOtherThing(function() {
  this.render('derp');
});
```
---
<a id="on">**on}**</a>

**Input** (<small>[on.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/on.input.js)</small>):
```js
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

test('it happens non-dotable identifier e.g. [test-foo]', function(assert) {
  assert.expect(1);

  this.on('test-foo', () => assert.ok(true));
  this.render(hbs`{{test-component test="test"}}`);
});

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
  integration: true,
  beforeEach(assert) {
    this.on('test', () => assert.ok(true));
  }
});

test('it happens', function(assert) {
  assert.expect(1);

  this.render(hbs`{{test-component test="test"}}`);
});

```

**Output** (<small>[on.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/on.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it happens', async function(assert) {
    assert.expect(1);

    this.actions.test = () => assert.ok(true);
    await render(hbs`{{test-component test="test"}}`);
  });

  test('it happens non-dotable identifier e.g. [test-foo]', async function(assert) {
    assert.expect(1);

    this.actions['test-foo'] = () => assert.ok(true);
    await render(hbs`{{test-component test="test"}}`);
  });
});

module('Integration | Component | FooBar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  hooks.beforeEach(function(assert) {
    this.actions.test = () => assert.ok(true);
  });

  test('it happens', async function(assert) {
    assert.expect(1);

    await render(hbs`{{test-component test="test"}}`);
  });
});

```
---
<a id="register">**register}**</a>

**Input** (<small>[register.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/register.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo', {
  beforeEach() {
    this.register('service:thingy', thingy);
    this.registry.register('service:thingy', thingy);
  }
});

test('it happens', function() {
  this.register('service:thingy', thingy);
  this.registry.register('service:thingy', thingy);
});

moduleFor('service:bar', 'Unit | Service | Bar');

test('it happens again?', function() {
  this.register('service:thingy', thingy);
  this.registry.register('service:thingy', thingy);
});

```

**Output** (<small>[register.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/register.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:thingy', thingy);
    this.owner.register('service:thingy', thingy);
  });

  test('it happens', function() {
    this.owner.register('service:thingy', thingy);
    this.owner.register('service:thingy', thingy);
  });
});

module('Unit | Service | Bar', function(hooks) {
  setupTest(hooks);

  test('it happens again?', function() {
    this.owner.register('service:thingy', thingy);
    this.owner.register('service:thingy', thingy);
  });
});

```
---
<a id="remove-empty-import">**remove-empty-import}**</a>

**Input** (<small>[remove-empty-import.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/remove-empty-import.input.js)</small>):
```js
import { module, test } from 'ember-qunit';

```

**Output** (<small>[remove-empty-import.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/remove-empty-import.output.js)</small>):
```js
import { module, test } from 'qunit';

```
---
<a id="resolver">**resolver}**</a>

**Input** (<small>[resolver.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/resolver.input.js)</small>):
```js
import { module } from 'qunit';
import { moduleFor, moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';

const resolver = engineResolverFor('appointments-manager');

moduleForComponent('date-picker', 'Integration | Component | Date picker', {
  integration: true,
  resolver
});

test('renders text', function(assert) {
  this.render(hbs`{{date-picker}}`);
  assert.equal(this.$().text().trim(), 'una fecha');
});

moduleFor('service:foo', {
  resolver
});

test('can resolve from custom resolver', function(assert) {
  assert.ok(this.container.lookup('service:foo'));
});

module('non-ember-qunit module', {
  resolver
});

test('custom resolver property means nothing, and ends up in `beforeEach`', function(assert) {
  assert.ok(this.container.lookup('service:foo'));
});

```

**Output** (<small>[resolver.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/resolver.output.js)</small>):
```js
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

```
---
<a id="rewrite-imports">**rewrite-imports}**</a>

**Input** (<small>[rewrite-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/rewrite-imports.input.js)</small>):
```js
import { moduleFor, moduleForComponent, moduleForModel } from 'ember-qunit';

```

**Output** (<small>[rewrite-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/rewrite-imports.output.js)</small>):
```js
import { module } from 'qunit';
import { setupTest } from 'ember-qunit';

```
---
<a id="simple-module-for">**simple-module-for}**</a>

**Input** (<small>[simple-module-for.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/simple-module-for.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo');

test('it happens', function() {

});

test('it happens again', function() {

});

// this one has comments
test('it happens and again', function() {

});

skip('this is included');

```

**Output** (<small>[simple-module-for.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/simple-module-for.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  test('it happens', function() {

  });

  test('it happens again', function() {

  });

  // this one has comments
  test('it happens and again', function() {

  });

  skip('this is included');
});

```
---
<a id="subject">**subject}**</a>

**Input** (<small>[subject.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/subject.input.js)</small>):
```js
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:flash', 'Unit | Service | Flash', {
  unit: true
});

test('should allow messages to be queued', function (assert) {
  let subject = this.subject();
});

moduleFor('service:non-singleton-service', 'Unit | Service | NonSingletonService', {
  unit: true
});

test('does something', function (assert) {
  let subject = this.subject({ name: 'James' });
});

moduleFor('model:foo', 'Unit | Model | Foo', {
  unit: true
});

test('has some thing', function (assert) {
  let subject = this.subject();
});

test('has another thing', function (assert) {
  let subject = this.subject({ size: 'big' });
});

moduleForModel('foo', 'Integration | Model | Foo', {
  integration: true
});

test('has some thing', function (assert) {
  let subject = this.subject();
});

moduleForModel('foo', 'Unit | Model | Foo', {
  needs: ['serializer:foo']
});

test('has some thing', function (assert) {
  let subject = this.subject();
});

moduleForComponent('foo-bar', 'Unit | Component | FooBar', {
  unit: true,
});

test('has some thing', function (assert) {
  let subject = this.subject();
});

test('has another thing', function (assert) {
  let subject = this.subject({ size: 'big' });
});

moduleFor('service:foo', {
  subject() {
    return derp();
  }
});

test('can use custom subject', function(assert) {
  let subject = this.subject();
});

moduleFor('service:foo', 'Unit | Service | Foo', {
  unit: true,

  beforeEach() {
    this.service = this.subject();
  }
});

test('can use service', function (assert) {
  this.service.something();
});

moduleFor('service:foo');

test('does not require more than one argument', function(assert) {
  let subject = this.subject();
});

moduleFor('service:foo', {
  integration: true
});

test('can use subject in moduleFor + integration: true', function(assert) {
  let subject = this.subject();
});

```

**Output** (<small>[subject.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/subject.output.js)</small>):
```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Service | Flash', function(hooks) {
  setupTest(hooks);

  test('should allow messages to be queued', function (assert) {
    let subject = this.owner.lookup('service:flash');
  });
});

module('Unit | Service | NonSingletonService', function(hooks) {
  setupTest(hooks);

  test('does something', function (assert) {
    let subject = this.owner.factoryFor('service:non-singleton-service').create({ name: 'James' });
  });
});

module('Unit | Model | Foo', function(hooks) {
  setupTest(hooks);

  test('has some thing', function (assert) {
    let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
  });

  test('has another thing', function (assert) {
    let subject = run(() => this.owner.lookup('service:store').createRecord('foo', { size: 'big' }));
  });
});

module('Integration | Model | Foo', function(hooks) {
  setupTest(hooks);

  test('has some thing', function (assert) {
    let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
  });
});

module('Unit | Model | Foo', function(hooks) {
  setupTest(hooks);

  test('has some thing', function (assert) {
    let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
  });
});

module('Unit | Component | FooBar', function(hooks) {
  setupTest(hooks);

  test('has some thing', function (assert) {
    let subject = this.owner.factoryFor('component:foo-bar').create();
  });

  test('has another thing', function (assert) {
    let subject = this.owner.factoryFor('component:foo-bar').create({ size: 'big' });
  });
});

module('service:foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.subject = function() {
      return derp();
    };
  });

  test('can use custom subject', function(assert) {
    let subject = this.subject();
  });
});

module('Unit | Service | Foo', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.service = this.owner.lookup('service:foo');
  });

  test('can use service', function (assert) {
    this.service.something();
  });
});

module('service:foo', function(hooks) {
  setupTest(hooks);

  test('does not require more than one argument', function(assert) {
    let subject = this.owner.lookup('service:foo');
  });
});

module('service:foo', function(hooks) {
  setupTest(hooks);

  test('can use subject in moduleFor + integration: true', function(assert) {
    let subject = this.owner.lookup('service:foo');
  });
});

```
---
<a id="test-skip-imports">**test-skip-imports}**</a>

**Input** (<small>[test-skip-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/test-skip-imports.input.js)</small>):
```js
import { moduleFor, test, skip } from 'ember-qunit';

```

**Output** (<small>[test-skip-imports.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/test-skip-imports.output.js)</small>):
```js
import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

```
---
<a id="wait">**wait}**</a>

**Input** (<small>[wait.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/wait.input.js)</small>):
```js
import wait from 'ember-test-helpers/wait';

function stuff() {
  wait().then(() => {
    otherStuff();
  });
}

```

**Output** (<small>[wait.input.js](transforms/convert-module-for-to-setup-test/__testfixtures__/wait.output.js)</small>):
```js
import { settled } from '@ember/test-helpers';

function stuff() {
  settled().then(() => {
    otherStuff();
  });
}

```
<!--FIXTURE_CONTENT_END-->

