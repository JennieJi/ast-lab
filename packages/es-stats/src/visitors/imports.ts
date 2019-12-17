import { Visitor } from '@babel/traverse';
import { StringLiteral, ExportDefaultSpecifier, ExportNamespaceSpecifier, ExportSpecifier } from '@babel/types'; 
import { Import } from "ast-lab-types";
import getPatternNames from '../getPatternNames';
import importSpecifier2Dependents from '../getModuleRefFromImportSpecifier';
import getModuleRefFromExportSpecifier from '../getModuleRefFromExportSpecifier';

export default function createExportVisitors(imports: Import[] = []): Visitor {
  return {
    ImportDeclaration({ node }) {
      const modulePath = node.source.value;
      node.specifiers.forEach((specifier) => {
        // @ts-ignore
        const dep = importSpecifier2Dependents(specifier);
        if (dep) {
          const { name, alias } = dep;
          imports.push({
            alias,
            name,
            source: modulePath
          });
        }
      });
    },
    // Dynamic import support
    CallExpression({ node, parent, parentPath }) {
      /** @todo enable by plugin? */
      let id = ((parent.type === 'AwaitExpression' ? parentPath.parent : parent) as any).id;
      if (id && node.callee.type === 'Import') {
        const { arguments: args } = node;
        if (args[0].type === 'StringLiteral') {
          getPatternNames(id).forEach(({ name, alias }) => {
            imports.push({
              alias,
              name,
              source: (args[0] as StringLiteral).value
            });
          });
        }
      }
      return;
    },
    ExportNamedDeclaration({ node }) {
      const { specifiers, source } = node;
      if (!source) { return; }
      if (specifiers.length) {
        specifiers.forEach(specifier => {
          const dep = getModuleRefFromExportSpecifier(specifier as ExportDefaultSpecifier | ExportNamespaceSpecifier | ExportSpecifier);
          if (dep) {
            imports.push({
              ...dep,
              source: source.value
            });
          }
        });
      }
    },
  };
}
