import path from 'path';
import fs from 'fs';
import getEs6Dependents from './es6Detect/getEs6Dependents';
import resolveModulePath from './resolveModulePath';
import markDependents from './markDependents';
import { PathNode,  Exports, Options } from './types';

type VisitedNode = Set<PathNode>;
type Visited = Map<string, VisitedNode>;

function visitPath(visited: Visited, marked: Exports, node: PathNode, options: Options) {
  const { importModule: source } = node;
  if (visited.has(source)) {
    (visited.get(source) as VisitedNode).add(node);
    return;
  } else {
    visited.set(source, new Set([node]));
  }

  const {
    loader,
    extensions
  } = options;
  const basePath = path.dirname(source)
  const resolve = (mod: string) => {
    return resolveModulePath(mod, basePath, options);
  };
  const deps = getEs6Dependents(source, {
    inDetail: false,
    loader(file: string) {
      const realPath = resolve(file);
      return realPath ? loader ? loader(realPath) : fs.readFileSync(realPath, 'utf8') : '';
    }
  });
  deps.forEach((i2e, mod) => {
    /**
     * @TODO extension validation, avoid resolving source that didn't transformed
     */
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
  const visited: Visited = new Map();
  const resolvedSourcePaths = sources.map(s => {
    const basePath = path.dirname(s);
    const sourcePath = resolveModulePath(s, basePath, options);
    if (sourcePath && !visited.has(sourcePath)) {
      const rootNode = {
        source: null,
        importModule: sourcePath,
        i2e: null,
        prev: null
      };
      visitPath(visited, marked, rootNode, options);
    }
    return sourcePath;
  })
  targets.forEach((_exported, mod) => {
    const nodes = visited.get(mod);
    if (nodes) {
      nodes.forEach(n => markDependents(marked, n));
    }
  });
  return (resolvedSourcePaths
  .filter(s => s && marked.has(s)) as string[]);
}
