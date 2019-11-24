// import fs from 'fs';
import path from 'path';
import { getExports, filterDependents, createResolver, hasExt, Exports } from 'get-dependencies';
import { getGitDiffs, GIT_OPERATION } from './getGitDiffs';
import exec from './exec';

type Transform = (raw: string, path: string) => string;

const gitRoot = exec('git rev-parse --show-toplevel');
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getAbsolutePath(relativePath: string) {
  return path.resolve(gitRoot, relativePath);
}
function getRelativePath(file: string) {
  return path.isAbsolute(file) ? path.relative(gitRoot, file) : file;
}

export function getRevisionFile(revision: string, file: string) {
  return exec(`git show ${revision}:${getRelativePath(file)}`);
}

function createLoader(revision: string, transform?: Transform) {
  return (file: string) => {
    const raw = getRevisionFile(revision, file);
    return Promise.resolve(transform ? transform(raw, file) : raw);
  };
}

 export function getTrackedFiles(revision: string = 'HEAD', paths?: string[]) {
  const raw = exec(`git ls-tree -r ${revision} --name-only --full-name ${paths &&paths.length ? paths.join(' ') : ''}`);
  return raw.split('\n');
}

type GetDiffExportMapOptions = {
  extensions?: string[],
  transform?: Transform
};
export async function getDiffExportMap(commit: string, { extensions, transform }: GetDiffExportMapOptions) {
  const diffs = getGitDiffs(commit);
  const exportMap = new Map() as Exports;
  const staleExportMap = new Map() as Exports;
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

class FileListIncludesPlugin {
  files: Set<string>;
  extensions: string[];

	constructor(files: string[], extensions?: string[]) {
    this.files = new Set(files);
    this.extensions = extensions || ['.jsx', '.js', '.ts', '.tsx'];
	}

	apply(resolver: any) {
		const target = resolver.ensureHook('resolved');
		resolver
			.getHook('directory')
			.tapAsync("FileListIncludesPlugin", (request: any, resolveContext: any, callback: any) => {
        const filename = request.path;
        const fileExt = this.extensions.find(ext => {
          const file = `${filename}${ext}`;
          const fileRelativePath =  path.relative(gitRoot, file);
          if (this.files.has(fileRelativePath)) {
            if (resolveContext.fileDependencies)
              resolveContext.fileDependencies.add(file);
            resolver.doResolve(
              target,
              {
                ...request,
                path: file
              },
              "existing file: " + file,
              resolveContext,
              callback
            );
            return true;
          }
          return false;
        });
        if (!fileExt) {
          if (resolveContext.missingDependencies) {
            resolveContext.missingDependencies.add(filename);
          }
          if (resolveContext.log) {
            resolveContext.log(filename + " doesn't exist");
          }
          return callback();
        }
			});
	}
};

type Options = {
  paths?: string[],
  modules?: string[],
  extensions?: string[],
  alias?: { [alias: string]: string },
  transform?: Transform,
};

async function dependenciesInRevision(revision: string, exports: Exports, options: Options) {
  const { extensions = DEFAULT_EXTENSIONS, paths, transform, modules, alias } = options;
  const trackedFiles = getTrackedFiles(revision, paths);
  const trackedFilesAbsolute = trackedFiles.map(getAbsolutePath);
  return await filterDependents(trackedFilesAbsolute, exports, {
    extensions,
    loader: createLoader(revision, transform),
    resolver: createResolver({
      extensions,
      alias,
      modules,
      plugins: [new FileListIncludesPlugin(trackedFiles, extensions)]
    })
  });
}

async function gitChangesAffected(
  commit: string, 
  options: Options = {} 
) {
  const { extensions = DEFAULT_EXTENSIONS, transform } = options;
  const [exportMap, staleExportMap] = await getDiffExportMap(commit, { 
    transform,
    extensions
  });
  const currentAffected = await dependenciesInRevision(commit, exportMap, options);
  const staleAffected = await dependenciesInRevision(`${commit}~1`, staleExportMap, options);
  /** @todo dedupe */
  return currentAffected.concat(staleAffected);
}
export default gitChangesAffected;