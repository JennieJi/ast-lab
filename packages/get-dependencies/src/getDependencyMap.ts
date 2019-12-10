import { DependencyMap, AffectedMap, Options } from 'ast-lab-types';
import getMemberDependency from './getMemberDependency';


export default async function getDependencyMap(sources: string[], opts: Options = {}) {
  const srcSet = new Set(sources);
  const depMap = new Map() as DependencyMap;
  sources.forEach(async (src) => {
    const fileDependencyMap = await getMemberDependency(src, opts);
    fileDependencyMap.forEach((memberDeps, mod) => {
      const affectedMap = depMap.get(mod) as AffectedMap;
      if (affectedMap) {
        memberDeps.forEach((entries, member) => {
          const affected = affectedMap.get(member);
          affectedMap.set(member, affected ? affected.concat(entries) : entries);
        });
      } else if (srcSet.has(mod)) {
        depMap.set(mod, memberDeps);
      }
    });
  });
  return depMap;
}