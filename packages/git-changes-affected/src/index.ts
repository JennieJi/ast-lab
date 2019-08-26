import path from 'path';
import { getExports, filterDependents, Alias, ModuleDirectory, Loader } from 'get-dependencies';
import { getGitDiffs } from './getGitDiffs';
import exec from './exec';

function gitRoot(){
  return exec('git rev-parse --show-toplevel');
}

function getRevisionFile(revision: string, file: string) {
  try {
    const ret = exec(`git show ${revision}:${file}`);
    return ret;
  } catch(e) {
    console.warn(e);
    return '';
  }
}

function getBeforeRevisionFile(revision: string, file: string) {
  return getRevisionFile(`${revision}~1`, file);
}


 export function getTrackedFiles(paths?: string[]) {
  const raw = exec(`git ls-tree -r master --name-only ${paths ? paths.join(' ')  : ''}`);
  return raw.split('\n');
}

type GetDiffExportMapOptions = {
  extensions?: string[],
  transform?: Loader
};
export function getDiffExportMap(commit: string, { extensions, transform }: GetDiffExportMapOptions) {
  const extToken = new RegExp(`.(${(extensions || ['js', 'jsx', 'ts', 'tsx']).join('|')})$`);
  const diffs = getGitDiffs(commit);
  const rootPath = gitRoot();
  const resolve = (relativePath: string) => path.resolve(rootPath, relativePath);
  const exportMap = new Map();
  diffs.forEach(({ target, source }) => {
    if (extToken && !extToken.test(target)) {
      return;
    }
    const targetExports = getExports(target, {
      loader: (file: string) => {
        const raw = getRevisionFile(commit, file);
        return transform ? transform(raw) : raw;
      }
    });
    const sourceExports = getExports(source, {
      loader: (file: string) => {
        const raw = getBeforeRevisionFile(commit, file);
        return transform ? transform(raw) : raw;
      }
    });
    const absoluteTargetPath = resolve(target);
    if (source === target) {
      exportMap.set(absoluteTargetPath, new Set([
        ...targetExports,
        ...sourceExports
      ]));
    } else {
      exportMap.set(absoluteTargetPath, new Set(targetExports));
      exportMap.set(resolve(source), new Set(sourceExports));
    }
  });
  return exportMap;
}

type Options = {
  paths?: string[],
  moduleDirectory?: ModuleDirectory,
  extensions?: string[],
  alias?: Alias,
  transform?: Loader
};

function gitChangesAffected(
  commit: string, 
  options: Options = {} 
) {
  const { extensions, paths, transform } = options;
  const exportMap = getDiffExportMap(commit, { 
    transform,
    extensions
  });
  const sources = getTrackedFiles(paths);
  return filterDependents(sources, exportMap, {
    ...options,
    loader: (file: string) => {
      const raw = getRevisionFile(commit, file);
      return transform ? transform(raw) : raw;
    }
  });
}
export default gitChangesAffected;