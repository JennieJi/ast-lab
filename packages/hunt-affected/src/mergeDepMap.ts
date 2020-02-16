import path from 'path';
import enhancedResolve from 'enhanced-resolve';
import _debug from 'debug';
import denodeify from './denodeify';
import { DependencyMap } from 'ast-lab-types';
import { Options } from './types';
import fileDepMap from './fileDepMap';
import appendEntries from './appendEntries';

const debug = _debug('hunt-affected:merge');
const core = new Set(require('module').builtinModules);
/**
 * Extract the dependency map of a list of source files.
 * @param sources A list of absolute source file paths
 * @param opts
 */
export default async function mergeDepMap(
  sources: string[],
  opts: Options = {}
): Promise<DependencyMap> {
  debug('===');
  const srcSet = new Set(sources);
  const depMap = new Map() as DependencyMap;
  const extensions = ['.js', '.json'];
  const parserPlugins = opts.parserOptions?.plugins;
  if (parserPlugins?.includes('typescript')) {
    extensions.push('.ts');
  }
  if (parserPlugins?.includes('jsx')) {
    extensions.push('.jsx');
    if (parserPlugins?.includes('typescript')) {
      extensions.push('.tsx');
    }
  }
  if (parserPlugins?.includes('flow')) {
    extensions.push('.flow');
  }
  const resolver =
    opts.resolver ||
    denodeify(
      enhancedResolve.create({
        extensions,
        ...(opts.resolverOptions || {}),
      })
    );

  const fileHandlers = sources.map(async src => {
    const fileDependencyMap = await fileDepMap(src, opts);
    const depMapHandlers = Array.from(fileDependencyMap).map(
      async ([modRelativePath, memberDeps]) => {
        debug(`${src} > ${modRelativePath} start`);
        const baseDir = path.dirname(src);
        let modPath = '' as string | void;
        if (path.isAbsolute(modRelativePath) || core.has(modRelativePath)) {
          modPath = modRelativePath;
        } else {
          try {
            modPath = await resolver(baseDir, modRelativePath);
          } catch (e) {
            // do nothing
          }
          if (!modPath) {
            modPath = /\.\w+$/.test(modRelativePath)
              ? path.resolve(baseDir, modRelativePath)
              : modRelativePath;
          } else if (/node_modules\//.test(modPath)) {
            modPath = modRelativePath;
          }
        }

        if (depMap.get(modPath)) {
          debug(
            `${src} > ${modPath} append entries: ${JSON.stringify(
              Array.from(memberDeps.entries())
            )}`
          );
          memberDeps.forEach((entries, member) => {
            appendEntries(depMap, modPath as string, member, entries);
          });
        } else if (srcSet.has(modPath)) {
          debug(
            `${src} > ${modPath} add new: ${JSON.stringify(
              Array.from(memberDeps.entries())
            )}`
          );
          depMap.set(modPath, memberDeps);
        } else {
          debug(`${src} > ${modPath} depMap not added!`);
        }
      }
    );
    await Promise.all(depMapHandlers);
  });
  await Promise.all(fileHandlers);
  return depMap;
}
