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

      specifiers.add(mappedName);
    })
    // Remove all existing import specifiers
    .remove();

  emberQUnitImports
    .get('specifiers')
    .replace(Array.from(specifiers).map(s => j.importSpecifier(j.identifier(s))));
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

  function createModule(p) {
    let calleeName = p.node.expression.callee.name;
    // Find the moduleName and the module's options
    let moduleName;
    let calleeArguments = p.node.expression.arguments.slice();
    let lastArgument = calleeArguments[calleeArguments.length - 1];
    if (lastArgument.type === 'ObjectExpression') {
      calleeArguments.pop();
    }
    moduleName = calleeArguments[1] || calleeArguments[0];

    // Create the new `module(moduleName, function(hooks) {});` invocation
    let callback = j.functionExpression(
      null /* no function name */,
      [j.identifier('hooks')],
      j.blockStatement([
        j.expressionStatement(
          j.callExpression(
            j.identifier(calleeName === 'moduleForComponent' ? 'setupRenderingTest' : 'setupTest'),
            [j.identifier('hooks')]
          )
        ),
      ])
    );
    let moduleInvocation = j.expressionStatement(
      j.callExpression(j.identifier('module'), [moduleName, callback])
    );

    return [moduleInvocation, callback.body.body];
  }

  let programPath = root.get('program');
  let bodyPath = programPath.get('body');

  let bodyReplacement = [];
  let currentModuleCallbackBody;
  bodyPath.each(expressionPath => {
    let expression = expressionPath.node;
    if (isModuleDefinition(expressionPath)) {
      let result = createModule(expressionPath);
      bodyReplacement.push(result[0]);
      currentModuleCallbackBody = result[1];
    } else if (currentModuleCallbackBody) {
      currentModuleCallbackBody.push(expression);
    } else {
      bodyReplacement.push(expression);
    }
  });

  bodyPath.replace(bodyReplacement);
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

  return root.toSource(printOptions);
};
