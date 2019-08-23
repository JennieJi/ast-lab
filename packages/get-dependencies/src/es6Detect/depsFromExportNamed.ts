import { Node, ModuleSpecifier } from 'estree';
import exportSpecifier2Dependents from './exportSpecifier2Dependents';
import { Dependents, ModuleImported } from '../types';

export default function depsFromExportNamed(dependencies: Dependents, node: Node) {
  if (node.type !== 'ExportNamedDeclaration') { return dependencies; }
  const modulePath = node.source && (node.source.value as string);
  if (!modulePath) { return dependencies; }
  if (!dependencies.get(modulePath)) {
    dependencies.set(modulePath, new Map() as ModuleImported);
  }
  node.specifiers.forEach((specifier: ModuleSpecifier) => {
    const depMap = dependencies.get(modulePath) as ModuleImported;
    dependencies.set(modulePath, exportSpecifier2Dependents(depMap, specifier));
  });
  return dependencies;
}
