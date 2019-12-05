import { Node, Program, ImportSpecifier } from "estree";
import getPatternIdentifiers from "./getPatternIdentifiers";

function getUnexportedRoots(ast: Program) {
  return ast.body.reduce((roots: string[], node: Node) => {
    switch (node.type) {
      case 'ImportDeclaration':
        return roots.concat(node.specifiers.map((specifier: ImportSpecifier) => specifier.local.name));
      case 'VariableDeclaration':
        node.declarations.forEach(({ id }) => {
          return roots.concat(getPatternIdentifiers(id));
        });
        break;
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
        if (node.id) {
          return roots.concat(getPatternIdentifiers(node.id));
        }
        break;
    }
    return roots;
  }, [] as string[]);
}
export default getUnexportedRoots;