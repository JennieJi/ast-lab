import { DependencyMap, Entry } from "./types";

type Visited = { [module: string]: { [member: string]: 1 } };

export default function visitDependencyMap(dependencyMap: DependencyMap, entries: Entry[]): Visited {
  const visited = {} as Visited;
  let entryQueue = entries;
  while(entryQueue.length) {
    const { source: mod, name } = entryQueue.shift() as Entry;
    let modVisited = visited[mod];
    if (!modVisited) {
      modVisited = visited[mod] = {};
    }
    const affected = dependencyMap.get(mod);
    if (affected && modVisited[name]) {
      const affectedEntries = affected.get(name);
      if (affectedEntries && affectedEntries.length) {
        entryQueue = entryQueue.concat(affectedEntries);
      }
    }
  }
  return visited;
}