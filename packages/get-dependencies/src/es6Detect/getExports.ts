// @ts-ignore
import Walker from 'node-source-walk';
import { Node, ModuleSpecifier } from 'estree';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';
import getPatternIdentifiers from './getPatternIdentifiers';
import { Loader, Exported } from '../types';

export type Options = {
  loader: Loader
}

export async function astFindExports(node: Node, opts: Options): Promise<Exported[]> {
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
      if (node.source && node.source.value) {
        return await getExports(node.source.value as string, opts);
      }
      return [];
    case "ExportDefaultDeclaration":
      return ['default'];
  }
  return [];
}

export default async function getExports(
  src: string,
  opts: Options
): Promise<string[]> {
  const {
    loader
  } = opts;
  const fileContent = await loader(src);
  if (!fileContent) {
    return [];
  }
  const { program: ast } = new Walker().parse(fileContent);
  const finders = await Promise.all(
    ast.body.map((node: Node) => astFindExports(node, opts)) as Array<ReturnType<typeof astFindExports>>
  )
  return finders.reduce(
    (ret: string[], exports: Exported[]) => ret.concat(exports),
    [] as Exported[]
  );
}
