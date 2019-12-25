import { DependencyMap, Entry } from "ast-lab-types";
import _debug from 'debug';

const debug = _debug('get-dependencies:visit');

type Visited = { [module: string]: { [member: string]: 1 } };

export default function visitDependencyMap(dependencyMap: DependencyMap, entries: Entry[]): Visited {
  const visited = {} as Visited;
  let entryQueue = entries;
  debug('visit entries:', entries);
  while(entryQueue.length) {
    const { source: mod, name } = entryQueue.shift() as Entry;
    let modVisited = visited[mod];
    if (!modVisited) {
      modVisited = visited[mod] = {};
    }
    const affected = dependencyMap.get(mod);
    debug(`${mod} affects`, affected);
    if (affected && !modVisited[name]) {
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