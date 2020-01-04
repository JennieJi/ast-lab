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
            source: modulePath,
            loc: specifier.loc
          });
        }
      });
    },
    // Dynamic import support
    CallExpression({ node, parent, parentPath }) {
      /** @todo enable by plugin? */
      if (node.callee.type !== 'Import') { return; }
      const { arguments: args, loc } = node;
      if (args[0].type !== 'StringLiteral') { return; }
      const source = (args[0] as StringLiteral).value;
      const id = ((parent && parent.type === 'AwaitExpression' ? parentPath.parent : parent) as any).id;
      if (id) {
        getPatternNames(id).forEach(({ name, alias }) => {
          imports.push({
            alias,
            name,
            source,
            loc
          });
        });
      } else {
        imports.push({
          alias: source,
          name: source,
          source,
          loc
        });
      }
    },
  };
}
