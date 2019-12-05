import fs from 'fs';
import path from 'path';
import enhancedResolve from 'enhanced-resolve';
import ecmaStats from 'es-stats';
import denodeify from './denodeify';
import { Module, Member, Entry, Import, DependencyMap, AffectedMap, Options } from './types';
import { MODULE_ALL } from './constants';

function updateDependencyMap(depMap: DependencyMap, mod: Module, member: Member, entry: Entry[]): void {
  const affected  = depMap.get(mod) || new Map() as AffectedMap;
  if (!depMap.has(mod)) {
    depMap.set(mod, affected);
  }
  affected.set(member, entry);
}

export default async function getMemberDependency(filePath: string, { resolver, loader }: Options): Promise<DependencyMap> {
  const _loader = loader || denodeify(fs.readFile);
  const _resolver = resolver || denodeify(enhancedResolve);
  const file = await _loader(filePath);
  if (!file) {
    throw new Error(`${filePath} is empty!`)
  }
  const { imports: target, exports: entry, relations } = ecmaStats(file);
  
  const depMap = new Map() as DependencyMap;
  const targetIndex = {} as { [key: string]: Import };

  const asyncHandlers = [] as Promise<void>[];
  const targetIndexingHandlers = target.map(async (ref) => {
    const { name, source, alias } = ref;
    const resolvedSource = await _resolver(path.dirname(source), filePath);
    if (!resolvedSource) { return; }
    updateDependencyMap(depMap, resolvedSource, name, [] as Entry[]);
    targetIndex[alias] = ref;
  });
  asyncHandlers.concat(targetIndexingHandlers);

  if (entry.extends) {
    const extendModuleHandlers = entry.extends.map(async (source) => {
      const resolvedSource = await _resolver(path.dirname(source), filePath);
      if (!resolvedSource) { return; }
      updateDependencyMap(depMap, resolvedSource, MODULE_ALL, [{
        name: MODULE_ALL,
        source: filePath
      }]);
    })
    asyncHandlers.concat(extendModuleHandlers);
  }

  await Promise.all(asyncHandlers);

  entry.members.forEach(({ name, alias }) => {
    const dependents = new Set() as Set<Import>;
    const dependsOn = relations[name];
    const toClear = new Set() as Set<Module>;
    dependsOn.forEach(dependent => {
      const importRef = targetIndex[dependent];
      if (importRef) {
        dependents.add(importRef);
      } else {
        relations[dependent].forEach(dependsOn.add);
        toClear.add(dependent);
      }
    });
    /** @todo verify whether this helps for performance */
    toClear.forEach(dependsOn.delete);
    dependents.forEach(importRef => {
      ((depMap.get(importRef.source) as AffectedMap).get(importRef.name) as Entry[]).push({
        name: alias,
        source: filePath
      });
    });
  });

  return depMap;
}
