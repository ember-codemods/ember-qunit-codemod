module.exports = function(file, api, options) {
  const j = api.jscodeshift;

  const importMapping = {
    'moduleFor': 'setupTest'
  }

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  // Find `ember-qunit` imports
  let emberQUnitImports = root.find(j.ImportDeclaration, { source: { value: 'ember-qunit' } });
  if (emberQUnitImports.size() === 0) {
    return file.source;
  }

  // Find `module` and `test` imports
  let migrateToQUnitImport = ['test', 'skip'];

  // Replace old with new test helpers imports 
  let removedQUnitImports = emberQUnitImports.find(j.ImportSpecifier)
    .filter(p => migrateToQUnitImport.includes(p.node.imported.name));


  if (removedQUnitImports.size() !== 0) {
    // Find existing `qunit` imports
    let qunitImports = root.find(j.ImportDeclaration, { source: { value: 'qunit' } });
    if (qunitImports.size() > 0) {

    } else {
      // Add new `import { ... } from 'qunit'` node
      let qunitImportSpecifiers = [];
      removedQUnitImports.forEach(p => {
        let specifier = j.importSpecifier(j.identifier(p.node.imported.name));
        qunitImportSpecifiers.push(specifier);
      });
      let newQUnitImport = j.importDeclaration(qunitImportSpecifiers, j.literal('qunit'));
      emberQUnitImports.insertBefore(newQUnitImport);
    } 

    removedQUnitImports.remove();
  } 

  return root.toSource(printOptions);
}

