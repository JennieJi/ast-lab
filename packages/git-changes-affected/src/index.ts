// import fs from 'fs';
import path from 'path';
import { getExports, filterDependents, hasExt, Alias, ModuleDirectory } from 'get-dependencies';
import { getGitDiffs, GIT_OPERATION } from './getGitDiffs';
import exec from './exec';

type Transform = (raw: string, path: string) => string;

const gitRoot = exec('git rev-parse --show-toplevel').trim();
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getAbsolutePath(relativePath: string) {
  return path.resolve(gitRoot, relativePath);
}
function getRelativePath(file: string) {
  return path.isAbsolute(file) ? path.relative(gitRoot, file) : file;
}

function getRevisionFile(revision: string, file: string) {
  // try {
    return exec(`git show ${revision}:${getRelativePath(file)}`);
  // } catch (err) {
  //   console.warn('Can not find ', file, revision);
  //   return '';
  // }
}

function createLoader(revision: string, transform?: Transform) {
  return (file: string) => {
    const raw = getRevisionFile(revision, file);
    return Promise.resolve(transform ? transform(raw, file) : raw);
  };
}

 export function getTrackedFiles(revision: string = 'HEAD', paths?: string[]) {
  const raw = exec(`git ls-tree -r ${revision} --name-only --full-name ${paths &&paths.length ? paths.join(' ') : gitRoot}`);
  return raw.split('\n').slice(0, -1);
}

type GetDiffExportMapOptions = {
  extensions?: string[],
  transform?: Transform
};
export async function getDiffExportMap(commit: string, { extensions, transform }: GetDiffExportMapOptions) {
  const diffs = getGitDiffs(commit);
  const exportMap = new Map();
  const staleExportMap = new Map();
  let queue = [] as Promise<void>[];
  diffs.forEach(({ target, source, operation }) => {
    if (!hasExt(target, extensions || DEFAULT_EXTENSIONS)) {
      return;
    }
    queue.push((async () => {
      const targetExports = operation === GIT_OPERATION.delete ?
        [] : 
        await getExports(target, {
          loader: createLoader(commit, transform)
        });
      const sourceExports = operation === GIT_OPERATION.new ?
        [] :
        await getExports(source, {
          loader: createLoader(`${commit}~1`, transform)
        });
      const absoluteTargetPath = getAbsolutePath(target);
      if (source === target) {
        exportMap.set(absoluteTargetPath, new Set([
          ...targetExports,
          ...sourceExports
        ]));
      } else {
        exportMap.set(absoluteTargetPath, new Set(targetExports));
        staleExportMap.set(getAbsolutePath(source), new Set(sourceExports));
      }
    })());
  });
  await Promise.all(queue);
  return [exportMap, staleExportMap];
}

type Options = {
  paths?: string[],
  moduleDirectory?: ModuleDirectory,
  extensions?: string[],
  alias?: Alias,
  transform?: Transform,
};

async function gitChangesAffected(
  commit: string, 
  options: Options = {} 
) {
  const { extensions = DEFAULT_EXTENSIONS, paths, transform, moduleDirectory, alias } = options;
  const [exportMap, staleExportMap] = await getDiffExportMap(commit, { 
    transform,
    extensions
  });
  const commitSources = getTrackedFiles(commit, paths).map(getAbsolutePath);
  const currentAffected =  await filterDependents(commitSources, exportMap, {
    moduleDirectory,
    alias,
    extensions,
    loader: createLoader(commit, transform)
  });
  const beforeCommitSources = getTrackedFiles(`${commit}~1`, paths).map(getAbsolutePath);

  const staleAffected = await filterDependents(beforeCommitSources, staleExportMap, {
    moduleDirectory,
    alias,
    extensions,
    loader: createLoader(`${commit}~1`, transform)
  });
  /** @todo dedupe */
  return currentAffected.concat(staleAffected);
}
export default gitChangesAffected;