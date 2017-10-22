module.exports = function(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function moveQUnitImportsFromEmberQUnit() {
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

  function updateToNewEmberQUnitImports() {
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
              let [, , setupType] = parseModule(p);
              specifiers.add(setupType);
            });
        } else {
          specifiers.add(mappedName);
        }
      })
      // Remove all existing import specifiers
      .remove();

    ['render', 'clearRender'].forEach(type => {
      let usages = findTestHelperUsageOf(root, type);
      if (usages.size() > 0) {
        specifiers.add(type);
      }
    });

    emberQUnitImports
      .get('specifiers')
      .replace(Array.from(specifiers).map(s => j.importSpecifier(j.identifier(s))));
  }

  function findTestHelperUsageOf(collection, property) {
    return collection.find(j.ExpressionStatement, {
      expression: {
        callee: {
          object: {
            type: 'ThisExpression',
          },
          property: {
            name: property,
          },
        },
      },
    });
  }

  function parseModule(p) {
    let calleeName = p.node.expression.callee.name;
    // Find the moduleName and the module's options
    let moduleName, subject, options, hasCustomSubject;
    let calleeArguments = p.node.expression.arguments.slice();
    let lastArgument = calleeArguments[calleeArguments.length - 1];
    if (lastArgument.type === 'ObjectExpression') {
      options = calleeArguments.pop();
    }
    moduleName = calleeArguments[1] || calleeArguments[0];
    subject = calleeArguments[0];

    let setupIdentifier = 'setupTest';
    if (options) {
      let hasIntegration = options.properties.some(p => p.key.name === 'integration');

      if (calleeName === `moduleForComponent`) {
        if (hasIntegration) {
          setupIdentifier = 'setupRenderingTest';
          subject = null;
        } else {
          subject = j.literal(`component:${calleeArguments[0].value}`);
        }
      } else if (calleeName === 'moduleForModel') {
        subject = j.literal(`model:${calleeArguments[0].value}`);
      }

      hasCustomSubject = options.properties.some(p => p.key.name === 'subject');
    }

    return [moduleName, options, setupIdentifier, subject, hasCustomSubject];
  }

  function updateModuleForToNestedModule() {
    const POSSIBLE_MODULES = [
      { expression: { callee: { name: 'moduleFor' } } },
      { expression: { callee: { name: 'moduleForComponent' } } },
      { expression: { callee: { name: 'moduleForModel' } } },
    ];

    function isModuleDefinition(nodePath) {
      return POSSIBLE_MODULES.some(matcher => j.match(nodePath, matcher));
    }

    function isMethod(nodePath) {
      return j.match(nodePath, { value: { type: 'FunctionExpression' } });
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
      let [moduleName, options, setupType, subject, hasCustomSubject] = parseModule(p);

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
        let customMethodBeforeEachBody, customMethodBeforeEachExpression;

        options.properties.forEach(property => {
          updateGetOwnerThisUsage(property.value);

          if (isLifecycleHook(property)) {
            let lifecycleStatement = j.expressionStatement(
              j.callExpression(j.memberExpression(j.identifier('hooks'), property.key), [
                property.value,
              ])
            );

            // preserve any comments that were present
            lifecycleStatement.comments = property.comments;

            callback.body.body.push(lifecycleStatement);
          } else if (isMethod(property)) {
            if (!customMethodBeforeEachBody) {
              customMethodBeforeEachBody = j.blockStatement([]);
              customMethodBeforeEachExpression = j.expressionStatement(
                j.callExpression(
                  j.memberExpression(j.identifier('hooks'), j.identifier('beforeEach')),
                  [
                    j.functionExpression(
                      null,
                      [
                        /* no arguments */
                      ],
                      customMethodBeforeEachBody
                    ),
                  ]
                )
              );

              callback.body.body.push(customMethodBeforeEachExpression);
            }

            let methodAssignment = j.expressionStatement(
              j.assignmentExpression(
                '=',
                j.memberExpression(j.thisExpression(), property.key),
                property.value
              )
            );

            // preserve any comments that were present
            methodAssignment.comments = property.comments;

            customMethodBeforeEachBody.body.push(methodAssignment);
          }
        });

        if (setupType === 'setupRenderingTest') {
          processExpressionForRenderingTest(callback);
        } else {
          processSubject(callback, subject);
        }
      }

      return [moduleInvocation, callback.body.body, setupType, subject, hasCustomSubject];
    }

    function processExpressionForRenderingTest(testExpression) {
      // mark the test function as an async function
      let testExpressionCollection = j(testExpression);

      // Transform to await render() or await clearRender()
      ['render', 'clearRender'].forEach(type => {
        findTestHelperUsageOf(testExpressionCollection, type).forEach(p => {
          let expression = p.get('expression');

          let awaitExpression = j.awaitExpression(
            j.callExpression(j.identifier(type), expression.node.arguments)
          );
          expression.replace(awaitExpression);
          p.scope.node.async = true;
        });
      });

      // Migrate `this._element` -> `this.element`
      testExpressionCollection
        .find(j.MemberExpression, {
          object: {
            type: 'ThisExpression',
          },
          property: {
            name: '_element',
          },
        })
        .forEach(p => {
          let property = p.get('property');
          property.node.name = 'element';
        });
    }

    function processSubject(testExpression, subject) {
      let thisDotSubjectUsage = j(testExpression).find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            name: 'subject',
          },
        },
      });

      if (thisDotSubjectUsage.size() === 0) {
        return;
      }

      thisDotSubjectUsage.forEach(p => {
        let options = p.node.arguments[0];
        let [subjectType, subjectName] = subject.value.split(':');
        let isSingletonSubject = !['model', 'component'].includes(subjectType);

        // if we don't have `options` and the type is a singleton type
        // use `this.owner.lookup(subject)`
        if (!options && isSingletonSubject) {
          p.replace(
            j.callExpression(
              j.memberExpression(
                j.memberExpression(j.thisExpression(), j.identifier('owner')),
                j.identifier('lookup')
              ),
              [subject]
            )
          );
        } else if (subjectType === 'model') {
          p.replace(
            j.callExpression(
              j.memberExpression(
                j.callExpression(
                  j.memberExpression(
                    j.memberExpression(j.thisExpression(), j.identifier('owner')),
                    j.identifier('lookup')
                  ),
                  [j.literal('service:store')]
                ),
                j.identifier('createRecord')
              ),
              [j.literal(subjectName), options].filter(Boolean)
            )
          );
        } else {
          p.replace(
            j.callExpression(
              j.memberExpression(
                j.callExpression(
                  j.memberExpression(
                    j.memberExpression(j.thisExpression(), j.identifier('owner')),
                    j.identifier('factoryFor')
                  ),
                  [subject]
                ),
                j.identifier('create')
              ),
              [options].filter(Boolean)
            )
          );
        }
      });
    }

    let programPath = root.get('program');
    let bodyPath = programPath.get('body');

    let bodyReplacement = [];
    let currentModuleCallbackBody, currentTestType, currentSubject, currentHasCustomSubject;
    bodyPath.each(expressionPath => {
      let expression = expressionPath.node;
      if (isModuleDefinition(expressionPath)) {
        let result = createModule(expressionPath);
        bodyReplacement.push(result[0]);
        currentModuleCallbackBody = result[1];
        currentTestType = result[2];
        currentSubject = result[3];
        currentHasCustomSubject = result[4];
      } else if (currentModuleCallbackBody) {
        currentModuleCallbackBody.push(expression);

        let isTest = j.match(expression, { expression: { callee: { name: 'test' } } });
        if (isTest) {
          updateGetOwnerThisUsage(expression.expression.arguments[1]);
          if (currentTestType === 'setupRenderingTest') {
            processExpressionForRenderingTest(expression);
          } else if (currentTestType === 'setupTest' && !currentHasCustomSubject) {
            processSubject(expression, currentSubject);
          }
        }
      } else {
        bodyReplacement.push(expression);
      }
    });

    bodyPath.replace(bodyReplacement);
  }

  function updateLookupCalls() {
    root
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

  function updateRegisterCalls() {
    root
      .find(j.MemberExpression, {
        object: {
          object: { type: 'ThisExpression' },
          property: { name: 'registry' },
        },
        property: { name: 'register' },
      })
      .forEach(path => {
        let thisDotOwner = j.memberExpression(j.thisExpression(), j.identifier('owner'));
        path.replace(j.memberExpression(thisDotOwner, path.value.property));
      });

    root
      .find(j.MemberExpression, {
        object: { type: 'ThisExpression' },
        property: { name: 'register' },
      })
      .forEach(path => {
        let thisDotOwner = j.memberExpression(j.thisExpression(), j.identifier('owner'));
        path.replace(j.memberExpression(thisDotOwner, path.value.property));
      });
  }

  function updateInjectCalls() {
    root
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            object: {
              type: 'ThisExpression',
            },
            property: {
              name: 'inject',
            },
          },
        },
      })
      .forEach(p => {
        let injectType = p.node.callee.property.name;
        let injectedName = p.node.arguments[0].value;
        let localName = injectedName;
        if (p.node.arguments[1]) {
          let options = p.node.arguments[1];
          let as = options.properties.find(property => property.key.name === 'as');
          if (as) {
            localName = as.value.value;
          }
        }
        let assignment = j.assignmentExpression(
          '=',
          j.memberExpression(j.thisExpression(), j.identifier(localName)),
          j.callExpression(
            j.memberExpression(
              j.memberExpression(j.thisExpression(), j.identifier('owner')),
              j.identifier('lookup')
            ),
            [j.literal(`${injectType}:${injectedName}`)]
          )
        );

        p.replace(assignment);
      });
  }

  function updateGetOwnerThisUsage(expression) {
    let expressionCollection = j(expression);
    let thisDotOwner = j.memberExpression(j.thisExpression(), j.identifier('owner'));

    function replacement(path) {
      if (path.scope.node === expression) {
        path.replace(thisDotOwner);
      }
    }

    expressionCollection
      .find(j.CallExpression, {
        callee: {
          name: 'getOwner',
        },
      })
      .forEach(replacement);

    expressionCollection
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            name: 'Ember',
          },
          property: {
            name: 'getOwner',
          },
        },
      })
      .forEach(replacement);
  }

  const printOptions = options.printOptions || { quote: 'single' };

  // Find `ember-qunit` imports
  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });
  if (emberQUnitImports.size() === 0) {
    return file.source;
  }

  moveQUnitImportsFromEmberQUnit();
  updateToNewEmberQUnitImports();
  updateModuleForToNestedModule();
  updateLookupCalls();
  updateRegisterCalls();
  updateInjectCalls();

  return root.toSource(printOptions);
};
