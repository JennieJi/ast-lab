import { Node } from 'estree';
import { Dependents } from '../types';
import { astFindExports, Options } from './getExports';

export default function depsFromExportAll(opts: Options) {
  return(deps: Dependents, node: Node) => {
    if (node.type === 'ExportAllDeclaration' && node.source && node.source.value) {
      deps.set(
        node.source.value as string,
        new Map(astFindExports(node, opts).map(name => [
          name,
          {
            alias: null,
            affectedExports: new Set()
          }
        ]))
      );
    }
    return deps;
  }
}
