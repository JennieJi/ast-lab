import path from 'path';
import { DependencyMap } from 'ast-lab-types';

const baseDir = path.resolve(__dirname, '__fixtures__');
// make source paths relative to avoid snapshot change
export function relativeDepMap(depMap: DependencyMap) {
  const updated = new Map() as DependencyMap;
  depMap.forEach((affectMap, mod) => {
    updated.set(
      path.isAbsolute(mod) ? path.relative(baseDir, mod) : mod,
      affectMap
    );
    affectMap.forEach(entries => {
      entries.forEach(entry => {
        entry.source = path.relative(baseDir, entry.source);
      });
    });
  });
  return updated;
}
