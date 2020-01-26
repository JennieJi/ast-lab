import { DependencyMap, Entry, Member } from "ast-lab-types";
import _debug from 'debug';
import { MODULE_ALL } from "./constants";

const debug = _debug('hunt-affected:visit');

export type Visited = { [module: string]: Set<Member> };

/**
 * Walk through the dependency map from given entries to find out what are affected.
 * @param dependencyMap 
 * @param entries 
 */
export default function visitDependencyMap(dependencyMap: DependencyMap, entries: Entry[]): Visited {
  const visited = {} as Visited;
  let entryQueue = entries;
  debug('visit entries:', entries);
  while(entryQueue.length) {
    const { source: mod, name } = entryQueue.shift() as Entry;
    let modVisited = visited[mod];
    if (!modVisited) {
      modVisited = visited[mod] = new Set();
    }
    const affected = dependencyMap.get(mod);
    debug(`${mod} affects`, affected);
    if (affected && !modVisited.has(name)) {
      modVisited.add(name);
      const matchedEntries = affected.get(name);
      debug('current queue:', entryQueue);
      if (matchedEntries && matchedEntries.length) {
        debug('new to queue:', matchedEntries);
        entryQueue = entryQueue.concat(matchedEntries);
      }
      const allEntries = affected.get(MODULE_ALL);
      if (allEntries &&  allEntries.length) {
        debug('new to queue:', allEntries);
        entryQueue = entryQueue.concat(allEntries);
      }
    }
  }
  return visited;
}