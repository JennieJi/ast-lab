import path from 'path';
import fs from 'fs';
import { DEFAULT_EXTENSIONS } from './constants';
import getEs6Dependents from './es6Detect/getEs6Dependents';
import createResolver from './createResolver';
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
    extensions,
    resolver,
  } = options;
  const { importModule: source } = node;

  const deps = await getEs6Dependents(source, {
    inDetail: false,
    async loader(file: string) {
      if (skipFile(file, extensions)) { return ''; }
      return loader ? loader(file) : fs.readFileSync(file, 'utf8');
    },
    resolver
  });
  addVisitedNode(visited, node);

  let queue = [] as Promise<any>[];
  deps.forEach((i2e, mod) => {
    if (skipFile(mod, extensions)) { 
      return;
    }
    queue.push((async () => {
      let importModule;
      try {
        importModule = await resolver(mod, source);
      } catch (err) {
        console.error(err);
        console.info('Node:', node);
        throw err;
      }
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
      try {
        await visitPath(visited, nextNode, options);
      } catch(err) {
        console.error(err);
        throw(err);
      }
    })())
  });
  await Promise.all(queue);
}

export default async function filterDependents(sources: string[], targets: Exports, options: Partial<Options> = {}): Promise<string[]> {
  // console.log('===============================');
  const visited: Visited = new Map();
  let resolvedSourcePaths = [] as string[];
  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const opts = {
    extensions,
    resolver: createResolver({ extensions }),
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
      try {
        await visitPath(visited, rootNode, opts);
      } catch(err) {
        console.error(err);
        throw(err);
      }
    }
  }
  const marked = new Map(Array.from(targets));
  markDependents(marked, visited);
  return resolvedSourcePaths.filter(s => marked.has(s));
}
