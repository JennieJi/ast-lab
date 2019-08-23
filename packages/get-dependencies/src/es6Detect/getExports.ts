// @ts-ignore
import Walker from 'node-source-walk';
import { Node, ModuleSpecifier, Program } from 'estree';
import fs from 'fs';
import _importSpecifier2Dependents from './importSpecifier2Dependents';
import _depsFromExportAll from './depsFromExportAll';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';
import getPatternIdentifiers from './getPatternIdentifiers';

export type Options = {
  resolve: (mod: string) => string | void,
  load: (file: string) => string
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
    load = (file: string) => fs.readFileSync(file, 'utf8')
  } = opts;
  const realPath = resolve(src);
  if (!realPath) {
    throw new Error('src cannot be found!');
  }
  const fileContent = load(realPath);
  console.log(realPath, fileContent.length);
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
