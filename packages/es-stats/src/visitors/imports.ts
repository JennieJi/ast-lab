import { Visitor } from '@babel/traverse';
import { StringLiteral } from '@babel/types'; 
import { Import } from "ast-lab-types";
import getPatternNames from '../getPatternNames';
import importSpecifier2Dependents from '../getModuleRefFromImportSpecifier';

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
  };
}
