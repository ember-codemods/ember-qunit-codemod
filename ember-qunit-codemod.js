function moveQUnitImportsFromEmberQUnit(j, root) {
  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });
  // Find `module` and `test` imports
  let migrateToQUnitImport = ['module', 'test', 'skip', 'todo'];

  let specifiers = new Set();
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
  let importNames = [];
  emberQUnitImports
    .find(j.ImportSpecifier)
    .forEach(p => {
      // Map them to the new imports
      let importName = p.node.imported.name;
      let mappedName = mapping[importName] || importName;

      // Only include non-duplicated imports
      if (!importNames.includes(mappedName)) {
        importNames.push(mappedName);
      }
    })
    // Remove all existing import specifiers
    .remove();

  emberQUnitImports.forEach(p => {
    // Add non-duplicated mapped import specifiers back to the import statement
    for (let i = 0; i < importNames.length; i++) {
      let specifier = j.importSpecifier(j.identifier(importNames[i]));
      p.node.specifiers.push(specifier);
    }
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

  return root.toSource(printOptions);
};
