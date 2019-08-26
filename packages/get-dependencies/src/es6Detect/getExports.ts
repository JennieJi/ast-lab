// @ts-ignore
import Walker from 'node-source-walk';
import { Node, ModuleSpecifier } from 'estree';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';
import getPatternIdentifiers from './getPatternIdentifiers';
import { Loader } from '../types';

export type Options = {
  loader: Loader
}

export function astFindExports(node: Node, opts: Options): string[] {
  switch (node.type) {
    case 'ExportNamedDeclaration':{
      const { specifiers, declaration } = node;
      if (specifiers.length) {
        return specifiers.reduce((ret, specifier: ModuleSpecifier) => {
          exportSpecifier2Dependents(new Map(), specifier)
            .forEach(({ alias }) =>  alias && ret.push(alias));
          return ret;
        }, [] as string[]);
      }
      if (declaration) {
        switch(declaration.type) {
          case 'VariableDeclaration':
            return declaration.declarations.reduce(
              (ret, { id }) =>
                ret.concat(getPatternIdentifiers(id)),
              [] as string[]
            );
          default:
            return declaration.id ? getPatternIdentifiers(declaration.id) : [];
        }
      }
    }
    case 'ExportAllDeclaration':
      return node.source && node.source.value ?
        getExports(node.source.value as string, opts) :
        [];
    case "ExportDefaultDeclaration":
      return ['default'];
  }
  return [];
}

export default function getExports(
  src: string,
  opts: Options
): string[] {
  const {
    loader
  } = opts;
  const fileContent = loader(src);
  if (!fileContent) {
    return [];
  }
  const insWalker = new Walker();
  const { program: ast } = insWalker.parse(fileContent);
  return ast.body.reduce(
    (ret: string[], node: Node) =>
      ret.concat(astFindExports(node, opts)),
    [] as string[]
  );
}
