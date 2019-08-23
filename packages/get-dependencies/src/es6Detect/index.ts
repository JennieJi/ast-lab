// @ts-ignore
import Walker from 'node-source-walk';
import { Node, ModuleSpecifier, Program } from 'estree';
import { Dependents, ModuleImported } from '../types';
// import getPatternIdentifiers from './getPatternIdentifiers';
import fs from 'fs';
import _importSpecifier2Dependents from './importSpecifier2Dependents';
import depsFromExportNamed from './depsFromExportNamed';
import _depsFromExportAll from './depsFromExportAll';

type Options = {
  inDetail?: boolean,
  resolve: (mod: string) => string | void,
  load: (file: string) => string
}

/**
 * Get ES6 file dependencies (module and imported defination)
 * @todo support import affected export mapping
 * @param src {string} file content
 * @param [inDetail] {boolean} NOT FULLY SUPPORTED. Get affected exports
 * @return {Map<string, Set<name> | null>}
 */
export default function getEs6Dependents(
  src: string,
  {
    inDetail,
    resolve,
    load = (file: string) => fs.readFileSync(file, 'utf8')
  }: Options): Dependents {
  const walkerIns = new Walker();
  let dependencies: Dependents = new Map();
  src = load(src);
  if (src === '') {
    return dependencies;
  }
  if (typeof src === 'undefined') {
    throw new Error('src is undefined!');
  }

  const ast: Program = walkerIns.parse(src).program;
  const importSpecifier2Dependents = _importSpecifier2Dependents(inDetail);
  const depsFromExportAll = _depsFromExportAll({ resolve, load });
  const rootDeclarations: string[] = ast.body.reduce((roots: string[], node: Node) => {
    switch (node.type) {
      case 'ImportDeclaration':{
        const modulePath = node.source && node.source.value as string;
        if (!modulePath) { return roots; }
        if (!dependencies.has(modulePath)) {
          dependencies.set(modulePath, new Map() as ModuleImported);
        }
        node.specifiers.forEach((specifier: ModuleSpecifier) => {
          const depMap = dependencies.get(modulePath) as ModuleImported;
          dependencies.set(modulePath, importSpecifier2Dependents(depMap, specifier));
          roots.push(specifier.local.name);
        });
        break;
      }
      case 'ExportNamedDeclaration':{
        const modulePath = node.source && (node.source.value as string);
        if (!modulePath) { return roots; }
        dependencies = depsFromExportNamed(dependencies, node);
        (dependencies.get(modulePath) as ModuleImported).forEach(
          ({ alias }, name) => roots.push(alias || name)
        );
        break;
      }
      case 'ExportAllDeclaration':
        dependencies = depsFromExportAll(dependencies, node);
        /** @todo find roots for export all */
        break;
      case "ExportDefaultDeclaration":
        roots.push('default');
        break;
      // case 'VariableDeclaration':
      //   node.declarations.forEach(({ id }) => {
      //     roots.concat(getPatternIdentifiers(id));
      //   });
      //   break;
      // case 'FunctionDeclaration':
      // case 'ClassDeclaration':
      //   roots.concat(getPatternIdentifiers(node.id));
      //   break;
    }
    return roots;
  }, [] as string[]);
  console.log(rootDeclarations);

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

  return dependencies;
}
