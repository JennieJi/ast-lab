import { Node, ModuleSpecifier } from 'estree';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';
import getPatternIdentifiers from './getPatternIdentifiers';
import getExports from './getExports';
import { Exported, Loader, Resolver } from '../types';
import resolveModulePath from '../createResolver';

export default async function astNodeExports(node: Node, file: string,  opts: {
  loader: Loader,
  resolver?: Resolver
}): Promise<Exported[]> {
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
        const mod = node.source.value as string;
        const fullPath = await (opts.resolver || resolveModulePath())(mod, file) as string;
        return await getExports(fullPath, opts);
      }
      return [];
    case "ExportDefaultDeclaration":
      return ['default'];
  }
  return [];
}