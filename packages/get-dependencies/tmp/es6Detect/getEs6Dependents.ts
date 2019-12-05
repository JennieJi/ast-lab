// @ts-ignore
import Walker from 'node-source-walk';
import { Node, ModuleSpecifier, Program } from 'estree';
import { Dependents, ModuleImported, Loader, Resolver } from '../types';
// import getPatternIdentifiers from './getPatternIdentifiers';
import fs from 'fs';
import _importSpecifier2Dependents from './importSpecifier2Dependents';
import astNodeExports from './astNodeExports';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';

type Options = {
  inDetail?: boolean,
  loader?: Loader,
  resolver?: Resolver
}

/**
 * Get ES6 file dependencies (module and imported defination)
 * @todo support import affected export mapping
 * @param file {string} file path
 * @param [inDetail] {boolean} NOT FULLY SUPPORTED. Get affected exports
 * @return {Map<string, Set<name> | null>}
 */
export default async function getEs6Dependents(
  file: string,
  {
    inDetail,
    loader: _loader,
    resolver
  }: Options): Promise<Dependents> {
  const walkerIns = new Walker();
  const loader = _loader || ((file: string) => Promise.resolve(fs.readFileSync(file, 'utf8')));
  const src = await loader(file);
  let dependencies: Dependents = new Map();
  if (src === '') {
    return dependencies;
  }
  if (typeof src === 'undefined') {
    throw new Error('src is undefined!');
  }

  const ast: Program = walkerIns.parse(src).program;
  const importSpecifier2Dependents = _importSpecifier2Dependents(inDetail);
  const findNodeExports = (ast: Node) => astNodeExports(ast, file, { loader, resolver });
  let queue = [] as Promise<any>[];
  ast.body.forEach((node: Node) => {
    switch (node.type) {
      case 'ImportDeclaration':{
        const modulePath = node.source && node.source.value as string;
        if (!modulePath) { return; }
        if (!dependencies.has(modulePath)) {
          dependencies.set(modulePath, new Map() as ModuleImported);
        }
        node.specifiers.forEach((specifier: ModuleSpecifier) => {
          const depMap = dependencies.get(modulePath) as ModuleImported;
          dependencies.set(modulePath, importSpecifier2Dependents(depMap, specifier));
        });
        break;
      }
      case 'ExportNamedDeclaration': {
        const modulePath = node.source && (node.source.value as string);
        if (!modulePath) { return; }
        if (!dependencies.get(modulePath)) {
          dependencies.set(modulePath, new Map() as ModuleImported);
        }
        node.specifiers.forEach((specifier: ModuleSpecifier) => {
          const depMap = dependencies.get(modulePath) as ModuleImported;
          dependencies.set(modulePath, exportSpecifier2Dependents(depMap, specifier));
        });
        break;
      }
      case 'ExportAllDeclaration': {
        queue.push(findNodeExports(node).then(exported => {
          if (node.source && node.source.value) {
            dependencies.set(
              node.source.value as string,
              new Map(exported.map((name: string) => [
                name,
                {
                  alias: null,
                  affectedExports: new Set()
                }
              ]))
            );
          }
        }));
        break;
      }
    }
  });

  /** @todo support dynamic import */
  // walkerIns.walk(ast, function(node: Node) {
  //   switch (node.type) {
  //     case 'CallExpression':
  //       if (['require', 'import'].includes((node.init.callee as Identifier).name)) {
  //         const { id, arguments: args } = node;
  //         if (id.type === 'ObjectPattern') {

  //         } else {
  //           dependencies.set(node.source.value, null);
  //         }
  //       }
  //       return;
  //     case 'Identifier':

  //       break;
  //   }
  // });
  await Promise.all(queue);

  return dependencies;
}
