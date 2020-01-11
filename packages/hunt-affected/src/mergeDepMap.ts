import path from 'path';
import enhancedResolve from 'enhanced-resolve';
import _debug from 'debug';
import denodeify from './denodeify';
import { DependencyMap, Options } from 'ast-lab-types';
import fileDepMap from './fileDepMap';
import appendEntries from './appendEntries';

const debug = _debug('hunt-affected:merge');
const core = new Set(require('module').builtinModules);
/**
 * 
 * @param sources {string[]}
 * @param opts {object}
 * @prop options.loader {Loader} Read file content from absolute file path. Uses fs.readFileSync as utf8 by default.
 * @prop options.parserOptions {@babel/parser.options} Allow customize babel parser options while parsing file content to AST.
 * @return {Promise<DependencyMap>}
 */
export default async function mergeDepMap(sources: string[], opts: Options = {}) {
  const srcSet = new Set(sources);
  const depMap = new Map() as DependencyMap;
  const resolver = opts.resolver || denodeify(enhancedResolve);

  const fileHandlers = [] as Array<Promise<any>>;
  sources.forEach((src) => {
    fileHandlers.push((async () => {
      const fileDependencyMap = await fileDepMap(src, opts);
      const depMapHandlers = [] as Array<Promise<any>>;
      fileDependencyMap.forEach((memberDeps, modRelativePath) => {
        debug(`${src} > ${modRelativePath} start`);
        depMapHandlers.push((async () => {
          const baseDir = path.dirname(src);
          let modPath = '';
          if (core.has(modRelativePath)) {
            modPath = modRelativePath;
          } else {
            try {
              modPath = await resolver(baseDir, modRelativePath) || '';
            } catch (e) {
              // do nothing
            }
            if (!modPath) {
              console.warn(`Could not solve ${modRelativePath} from ${src}.`);
              modPath = /\.\w+$/.test(modRelativePath) ? 
                path.resolve(baseDir, modRelativePath) :
                modRelativePath;
            } else if(/node_modules\//.test(modPath)) {
              modPath = modRelativePath;
            }
          }
          if (depMap.get(modPath)) {
            debug(`${src} > ${modPath} append entries: ${JSON.stringify(Array.from(memberDeps.entries()))}`);
            memberDeps.forEach((entries, member) => {
              appendEntries(depMap, modPath, member, entries);
            });
          } else if (srcSet.has(modPath)) {
            debug(`${src} > ${modPath} add new`);
            depMap.set(modPath, memberDeps);
          } else {
            debug(`${src} > ${modPath} depMap not added!`);
          }
        })());
      });
      await Promise.all(depMapHandlers);
    })());
  });
  await Promise.all(fileHandlers);
  return depMap;
}