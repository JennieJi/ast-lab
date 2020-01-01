import { DependencyMap, Entry, Member } from "ast-lab-types";
import _debug from 'debug';

const debug = _debug('get-dependencies:visit');

export type Visited = { [module: string]: Set<Member> };

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
      const affectedEntries = affected.get(name);
      debug('current queue:', entryQueue);
      debug('new to queue:', affectedEntries);
      if (affectedEntries && affectedEntries.length) {
        entryQueue = entryQueue.concat(affectedEntries);
      }
    }
  }
  return visited;
}