// @ts-ignore
import Walker from 'node-source-walk';
import { Node, ModuleSpecifier, Program } from 'estree';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';
import getPatternIdentifiers from './getPatternIdentifiers';

export type Options = {
  resolve: (mod: string) => string | void,
  loader: (file: string) => string
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
    resolve,
    loader
  } = opts;
  const realPath = resolve(src);
  if (!realPath) {
    throw new Error('src cannot be found!');
  }
  const fileContent = loader(realPath);
  if (!fileContent) {
    return [];
  }

  const ast: Program = new Walker().parse(fileContent).program;
  return ast.body.reduce(
    (ret: string[], node: Node) =>
      ret.concat(astFindExports(node, opts)),
    [] as string[]
  );
}
