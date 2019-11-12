import fs from 'fs';
import path from 'path';
import { getExports, filterDependents, Alias, ModuleDirectory } from 'get-dependencies';
import { getGitDiffs } from './getGitDiffs';
import exec from './exec';

type Transform = (raw: string, path: string) => string;

function gitRoot(){
  return exec('git rev-parse --show-toplevel').trim();
}
function getAbsolutePath(relativePath: string) {
  return path.resolve(gitRoot(), relativePath);
}

function getRevisionFile(revision: string, file: string) {
  try {
    const ret = exec(`git show ${revision}:${file}`);
    return ret;
  } catch(e) {
    console.warn(`WARN ${file} ${revision}`);
    return '';
  }
}

function getBeforeRevisionFile(revision: string, file: string) {
  return getRevisionFile(`${revision}~1`, file);
}


 export function getTrackedFiles(revision: string, paths?: string[]) {
  const raw = exec(`git ls-tree -r ${revision} --name-only ${paths ? paths.join(' ')  : ''}`);
  return raw.split('\n');
}

type GetDiffExportMapOptions = {
  extensions?: string[],
  transform?: Transform
};
export function getDiffExportMap(commit: string, { extensions, transform }: GetDiffExportMapOptions) {
  const extToken = new RegExp(`.(${(extensions || ['js', 'jsx', 'ts', 'tsx']).join('|')})$`);
  const diffs = getGitDiffs(commit);
  const exportMap = new Map();
  diffs.forEach(({ target, source }) => {
    if (extToken && !extToken.test(target)) {
      return;
    }
    const targetExports = getExports(target, {
      loader: (file: string) => {
        const raw = getRevisionFile(commit, file);
        return transform ? transform(raw, file) : raw;
      }
    });
    const sourceExports = getExports(source, {
      loader: (file: string) => {
        const raw = getBeforeRevisionFile(commit, file);
        return transform ? transform(raw, file) : raw;
      }
    });
    const absoluteTargetPath = getAbsolutePath(target);
    if (source === target) {
      exportMap.set(absoluteTargetPath, new Set([
        ...targetExports,
        ...sourceExports
      ]));
    } else {
      exportMap.set(absoluteTargetPath, new Set(targetExports));
      exportMap.set(getAbsolutePath(source), new Set(sourceExports));
    }
  });
  return exportMap;
}

type Options = {
  paths?: string[],
  moduleDirectory?: ModuleDirectory,
  extensions?: string[],
  alias?: Alias,
  transform?: Transform,
};

function gitChangesAffected(
  commit: string, 
  options: Options = {} 
) {
  const { extensions, paths, transform } = options;
  exec(`git checkout ${commit}`);
  const exportMap = getDiffExportMap(commit, { 
    transform,
    extensions
  });
  const sources = getTrackedFiles(commit, paths).map(getAbsolutePath);
  return filterDependents(sources, exportMap, {
    ...options,
    loader(file: string) {
      const raw = fs.readFileSync(file, 'utf-8');
      return transform ? transform(raw, file) : raw;
    }
  });
}
export default gitChangesAffected;