function moveQUnitImportsFromEmberQUnit(j, root) {
  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });
  // Find `module` and `test` imports
  let migrateToQUnitImport = ['module', 'test', 'skip', 'todo'];

  let specifiers = new Set(['module']);
  // Replace old with new test helpers imports
  emberQUnitImports
    .find(j.ImportSpecifier)
    .filter(p => migrateToQUnitImport.includes(p.node.imported.name))
    .forEach(p => specifiers.add(p.node.imported.name))
    .remove();

  let qunitImports = root.find(j.ImportDeclaration, { source: { value: 'qunit' } });
  qunitImports.find(j.ImportSpecifier).forEach(p => specifiers.add(p.node.imported.name));

  if (specifiers.size === 0) {
    return;
  }

  if (qunitImports.size() === 0) {
    // Add new `import from 'qunit'` node
    let newQUnitImport = j.importDeclaration([], j.literal('qunit'));
    emberQUnitImports.insertBefore(newQUnitImport);
    qunitImports = j(newQUnitImport);
  }

  qunitImports.get('specifiers').replace(
    Array.from(specifiers)
      .sort()
      .map(s => j.importSpecifier(j.identifier(s)))
  );
}

function updateToNewEmberQUnitImports(j, root) {
  let mapping = {
    moduleFor: 'setupTest',
    moduleForComponent: 'setupRenderingTest',
    moduleForModel: 'setupTest',
  };

  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });

  // Collect all imports from ember-qunit into local array
  let specifiers = new Set();
  emberQUnitImports
    .find(j.ImportSpecifier)
    .forEach(p => {
      // Map them to the new imports
      let importName = p.node.imported.name;
      let mappedName = mapping[importName] || importName;

      // If importName is `moduleForComponent` determine if we need
      // `setupTest` (unit) or `setupRenderingTest` (integration)
      if (importName === 'moduleForComponent') {
        root
          .find(j.ExpressionStatement, {
            expression: {
              callee: { name: 'moduleForComponent' },
            },
          })
          .forEach(p => {
            let [, , setupType] = parseModule(j, p);
            specifiers.add(setupType);
          });
      } else {
        specifiers.add(mappedName);
      }
    })
    // Remove all existing import specifiers
    .remove();

  let renderUsages = findRenderUsages(j, root);
  if (renderUsages.size() > 0) {
    specifiers.add('render');
  }

  emberQUnitImports
    .get('specifiers')
    .replace(Array.from(specifiers).map(s => j.importSpecifier(j.identifier(s))));
}

function findRenderUsages(j, root) {
  return root.find(j.ExpressionStatement, {
    expression: {
      callee: {
        object: {
          type: 'ThisExpression',
        },
        property: {
          name: 'render',
        },
      },
    },
  });
}

function parseModule(j, p) {
  let calleeName = p.node.expression.callee.name;
  // Find the moduleName and the module's options
  let moduleName, options;
  let calleeArguments = p.node.expression.arguments.slice();
  let lastArgument = calleeArguments[calleeArguments.length - 1];
  if (lastArgument.type === 'ObjectExpression') {
    options = calleeArguments.pop();
  }
  moduleName = calleeArguments[1] || calleeArguments[0];

  let setupIdentifier = 'setupTest';
  if (calleeName === `moduleForComponent` && options) {
    let hasIntegration = options.properties.some(p => p.key.name === 'integration');

    if (hasIntegration) {
      setupIdentifier = 'setupRenderingTest';
    }
  }

  return [moduleName, options, setupIdentifier];
}

function updateModuleForToNestedModule(j, root) {
  const POSSIBLE_MODULES = [
    { expression: { callee: { name: 'moduleFor' } } },
    { expression: { callee: { name: 'moduleForComponent' } } },
    { expression: { callee: { name: 'moduleForModel' } } },
  ];

  function isModuleDefinition(nodePath) {
    return POSSIBLE_MODULES.some(matcher => j.match(nodePath, matcher));
  }

  const LIFE_CYCLE_METHODS = [
    { key: { name: 'before' }, value: { type: 'FunctionExpression' } },
    { key: { name: 'beforeEach' }, value: { type: 'FunctionExpression' } },
    { key: { name: 'afterEach' }, value: { type: 'FunctionExpression' } },
    { key: { name: 'after' }, value: { type: 'FunctionExpression' } },
  ];

  function isLifecycleHook(nodePath) {
    return LIFE_CYCLE_METHODS.some(matcher => j.match(nodePath, matcher));
  }

  function createModule(p) {
    let [moduleName, options, setupType] = parseModule(j, p);

    // Create the new `module(moduleName, function(hooks) {});` invocation
    let callback = j.functionExpression(
      null /* no function name */,
      [j.identifier('hooks')],
      j.blockStatement([
        j.expressionStatement(j.callExpression(j.identifier(setupType), [j.identifier('hooks')])),
      ])
    );
    let moduleInvocation = j.expressionStatement(
      j.callExpression(j.identifier('module'), [moduleName, callback])
    );

    if (options) {
      options.properties.forEach(property => {
        if (isLifecycleHook(property)) {
          let lifecycleStatement = j.expressionStatement(
            j.callExpression(j.memberExpression(j.identifier('hooks'), property.key), [
              property.value,
            ])
          );

          // preserve any comments that were present
          lifecycleStatement.comments = property.comments;

          callback.body.body.push(lifecycleStatement);
        }
      });
    }

    return [moduleInvocation, callback.body.body, setupType];
  }

  function processRenderingTest(expression) {
    let isTest = j.match(expression, { expression: { callee: { name: 'test' } } });
    if (!isTest) {
      return;
    }

    // mark the test function as an async function
    expression.expression.arguments[1].async = true;

    let renderUsage = findRenderUsages(j, j(expression));

    renderUsage.forEach(p => {
      let expression = p.get('expression');

      let awaitExpression = j.awaitExpression(
        j.callExpression(j.identifier('render'), expression.node.arguments)
      );
      expression.replace(awaitExpression);
    });
  }

  let programPath = root.get('program');
  let bodyPath = programPath.get('body');

  let bodyReplacement = [];
  let currentModuleCallbackBody, currentTestType;
  bodyPath.each(expressionPath => {
    let expression = expressionPath.node;
    if (isModuleDefinition(expressionPath)) {
      let result = createModule(expressionPath);
      bodyReplacement.push(result[0]);
      currentModuleCallbackBody = result[1];
      currentTestType = result[2];
    } else if (currentModuleCallbackBody) {
      currentModuleCallbackBody.push(expression);

      if (currentTestType === 'setupRenderingTest') {
        processRenderingTest(expression);
      }
    } else {
      bodyReplacement.push(expression);
    }
  });

  bodyPath.replace(bodyReplacement);
}

function updateLookupCalls(j, root) {
  return root
    .find(j.MemberExpression, {
      object: {
        object: { type: 'ThisExpression' },
        property: { name: 'container' },
      },
      property: { name: 'lookup' },
    })
    .forEach(path => {
      let thisDotOwner = j.memberExpression(j.thisExpression(), j.identifier('owner'));
      path.replace(j.memberExpression(thisDotOwner, path.value.property));
    });
}

module.exports = function(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  // Find `ember-qunit` imports
  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });
  if (emberQUnitImports.size() === 0) {
    return file.source;
  }

  moveQUnitImportsFromEmberQUnit(j, root);
  updateToNewEmberQUnitImports(j, root);
  updateModuleForToNestedModule(j, root);
  updateLookupCalls(j, root);

  return root.toSource(printOptions);
};
