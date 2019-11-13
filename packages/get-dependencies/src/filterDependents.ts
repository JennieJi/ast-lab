import path from 'path';
import fs from 'fs';
import { DEFAULT_EXTENSIONS } from './constants';
import getEs6Dependents from './es6Detect/getEs6Dependents';
import resolveModulePath from './resolveModulePath';
import markDependents from './markDependents';
import hasExt from './hasExt';
import { PathNode,  Exports, Options, Visited, VisitedNode } from './types';

function skipFile(file: string, extensions: string[] | void){
  return extensions && !hasExt(file, extensions) && hasExt(file);
}

function addVisitedNode(visited: Visited, node: PathNode) {
  const { importModule } = node;
  if (visited.has(importModule)) {
    (visited.get(importModule) as VisitedNode).push(node);
    return;
  } else {
    visited.set(importModule, [node]);
  }
}

async function visitPath(visited: Visited, node: PathNode, options: Options) {
  const {
    loader,
    extensions
  } = options;
  const { importModule: source } = node;
  const basePath = path.dirname(source)
  const resolve = async (mod: string) => {
    try {
      return await resolveModulePath(mod, basePath, options);
    } catch (err) {
      console.info('Visiting node: ', node);
      console.log(err);
    }
  };
  const deps = await getEs6Dependents(source, {
    inDetail: false,
    async loader(file: string) {
      if (skipFile(file, extensions)) { return ''; }
      const realPath = await resolve(file);
      return realPath ? loader ? loader(realPath) : fs.readFileSync(realPath, 'utf8') : '';
    }
  });
  addVisitedNode(visited, node);

  let queue = [] as Promise<any>[];
  deps.forEach((i2e, mod) => {
    if (skipFile(mod, extensions)) { 
      return;
    }
    queue.push((async () => {
      const importModule = await resolve(mod);
      if (!importModule) { return; }
      const visitedPaths = visited.get(importModule);
      if (visitedPaths && visitedPaths.find(node => node.source === source)) {
        return;
      }
      const nextNode: PathNode = {
        source,
        importModule,
        i2e,
        prev: node,
      };
      await visitPath(visited, nextNode, options);
    })())
  });
  await Promise.all(queue);
}

export default async function filterDependents(sources: string[], targets: Exports, options: Options = {}): Promise<string[]> {
  // console.log('===============================');
  const visited: Visited = new Map();
  let resolvedSourcePaths = [] as string[];
  options = {
    extensions: DEFAULT_EXTENSIONS,
    ...options
  };
  for(let i = 0; i < sources.length; i++) {
    const sourcePath = sources[i];
    if (!sourcePath || !hasExt(sourcePath) || !path.isAbsolute(sourcePath)) {
      continue;
    }
    resolvedSourcePaths.push(sourcePath);
    if (!visited.has(sourcePath)) {
      const rootNode = {
        source: null,
        importModule: sourcePath,
        i2e: null,
        prev: null
      };
      await visitPath(visited, rootNode, options);
    }
  }
  const marked = new Map(Array.from(targets));
  markDependents(marked, visited);
  return resolvedSourcePaths.filter(s => marked.has(s));
}
