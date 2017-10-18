function moveQUnitImportsFromEmberQUnit(j, root) {
  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });
  // Find `module` and `test` imports
  let migrateToQUnitImport = ['module', 'test', 'skip', 'todo'];

  // Replace old with new test helpers imports
  let removedQUnitImports = emberQUnitImports
    .find(j.ImportSpecifier)
    .filter(p => migrateToQUnitImport.includes(p.node.imported.name));

  if (removedQUnitImports.size() !== 0) {
    // Find existing `qunit` imports
    let qunitImports = root.find(j.ImportDeclaration, { source: { value: 'qunit' } });
    if (qunitImports.size() > 0) {
      // Iterate removed imports
      removedQUnitImports.forEach(p => {
        // Check if the imported name already exists
        let foundSpecifier = qunitImports.find(j.ImportSpecifier, {
          imported: { name: p.node.imported.name },
        });
        if (foundSpecifier.size() === 0) {
          // Add the specifier being removed, if it wasn't already present
          let specifier = j.importSpecifier(j.identifier(p.node.imported.name));
          qunitImports.forEach(p => p.node.specifiers.push(specifier));
        }
      });
    } else {
      // Build up array of specifiers for the new import statement
      let qunitImportSpecifiers = [];
      removedQUnitImports.forEach(p => {
        let specifier = j.importSpecifier(j.identifier(p.node.imported.name));
        qunitImportSpecifiers.push(specifier);
      });

      // Add new `import { ... } from 'qunit'` node
      let newQUnitImport = j.importDeclaration(qunitImportSpecifiers, j.literal('qunit'));
      emberQUnitImports.insertBefore(newQUnitImport);
    }

    removedQUnitImports.remove();
  }
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
