import { Entry } from 'ast-lab-types';
import { DependencyMap } from './types';
import _debug from 'debug';
import { MODULE_ALL } from './constants';

const debug = _debug('hunt-affected:visit');

export type Affected = { [module: string]: Set<string> };

/**
 * Walk through the dependency map from given entries to find out what are affected.
 * @param dependencyMap
 * @param entries
 */
export default function visitDependencyMap(
  dependencyMap: DependencyMap,
  entries: Entry[]
): Affected {
  const visited = {} as Affected;
  let entryQueue = entries;
  debug('visit entries:', entries);
  while (entryQueue.length) {
    const { source: mod, name } = entryQueue.shift() as Entry;
    let modVisited = visited[mod];
    if (!modVisited) {
      modVisited = visited[mod] = new Set();
    }
    const declarations = dependencyMap[mod];
    if (declarations && !modVisited.has(name)) {
      modVisited.add(name);
      const matchedEntries = declarations[name];
      debug('current queue:', entryQueue);
      if (matchedEntries) {
        debug('new to queue:', matchedEntries);
        entryQueue = entryQueue.concat(matchedEntries.affects);
      }
      const allEntries = declarations[MODULE_ALL];
      if (allEntries) {
        debug('new to queue:', allEntries);
        entryQueue = entryQueue.concat(allEntries.affects);
      }
    }
  }
  return visited;
}
