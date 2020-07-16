import * as path from 'path';
import { DependencyMap } from '../src/types';

const baseDir = path.resolve(__dirname, '__fixtures__');
const getRelative = (mod: string) =>
  path.isAbsolute(mod) ? path.relative(baseDir, mod) : mod;
// make source paths relative to avoid snapshot change
export function relativeDepMap(depMap: DependencyMap) {
  return Object.fromEntries(
    Object.entries(depMap).map(([mod, declarations]) => {
      Object.values(declarations).forEach(d => {
        d.source = getRelative(d.source);
      });
      return [getRelative(mod), declarations];
    })
  );
}
