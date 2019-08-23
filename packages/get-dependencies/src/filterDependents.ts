import path from 'path';
import getEs6Dependents from './es6Detect/getEs6Dependents';
import resolveModulePath from './resolveModulePath';
import markDependents from './markDependents';
import { PathNode,  Exports, Options } from './types';

type Visited = Set<string>;

function visitPath(visited: Visited, marked: Exports, node: PathNode, options: Options) {
  const { importModule: source } = node;
  const {
    loader,
  } = options;
  const resolve = (mod: string) => resolveModulePath(mod, path.dirname(source), options);
  const deps = getEs6Dependents(source, {
    inDetail: false,
    resolve,
    loader
  });
  visited.add(source);
  // console.log('marking == ', node);
  markDependents(marked, node);
  // console.log('deps == ', deps);
  // console.log('marked == ', marked);
  deps.forEach((i2e, mod) => {
    const importModule = resolve(mod);
    if (!importModule) { return; }
    const nextNode: PathNode = {
      source,
      importModule,
      i2e,
      prev: node,
    };
    visitPath(visited, marked, nextNode, options);
  });
}

export default function filterDependents(sources: string[], targets: Exports, options: Options = {}): string[] {
  // console.log('===============================');
  const marked = new Map(targets.entries());
  const visited: Visited = new Set();
  const filtered: Set<string> = sources
    .reduce((ret, s) => {
      const sourcePath = resolveModulePath(s, path.dirname(s), options);
      if (!sourcePath) {
        return ret;
      }
      if (!visited.has(sourcePath)) {
        const rootNode = {
          source: null,
          importModule: sourcePath,
          i2e: null,
          prev: null
        };
        visitPath(visited, marked, rootNode, options);
      }
      // console.log('marked == ', marked);
      // console.log('source == ', sourcePath);
      if (marked.has(sourcePath)) {
        // console.log('added == ', sourcePath);
        ret.add(sourcePath);
      }
      return ret;
    }, new Set() as Set<string>);
  return Array.from(filtered);
}
