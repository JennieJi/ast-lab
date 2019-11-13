import path from 'path';
import resolve from 'enhanced-resolve';
// @ts-ignore
import _filterDependents from '../../src/filterDependents';

const FIXTURE_DIR = '../__fixtures__';
export const resolvePath = (file: string) => path.resolve(__dirname, FIXTURE_DIR, file);

function makeTargets(basedir: string, data: {
  [mod: string]: string[]
}) {
  return new Map(Object.keys(data).map(mod => {
    return [
      resolve.sync(resolvePath(basedir), mod),
      new Set(data[mod])
    ];
  }));
}
export async function filterDependents(
  basedir: string,
  sources: string[],
  imports: {
    [mod: string]: string[]
  },
  ...args: any[]
) {
  const sourcePaths = sources.map(s => resolvePath(path.join(basedir, s)));
  const targets = makeTargets(basedir, imports);
  const dependents = await _filterDependents(
    sourcePaths,
    targets,
    ...args
  )
  return dependents.map(absolute => absolute.replace(resolvePath(''), ''));
}