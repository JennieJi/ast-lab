import markExports from './markExports';
import { Exports, Visited, PathNode, VisitedNode } from './types';
import { ALL_MODULES } from './constants';


function getInitialNodes(marked: Exports, visited: Visited): PathNode[] {
  let nodes = [] as PathNode[];
  marked.forEach((_exported, mod) => {
    if (!visited.has(mod)) { return; }
    nodes = nodes.concat(visited.get(mod) as VisitedNode);
  });
  return nodes;
}

function markDependents(marked: Exports, visited: Visited) {
  let nodes = getInitialNodes(marked, visited);
  while(nodes.length) {
    const { source, importModule, i2e, prev } = nodes.shift() as PathNode;
    const markedExported = marked.get(importModule);
    if (!source || !i2e || !markedExported) {
      continue;
    }
    /** @todo remove this temp workaround logic */
    const importAll = i2e.get(ALL_MODULES);
    if (importAll) {
      markExports(marked, source, importAll.affectedExports);
    } else if (markedExported instanceof Set) {
      markedExported.forEach(exported => {
        const affectedSourceExports = i2e.get(exported);
        if (affectedSourceExports) {
          markExports(marked, source, affectedSourceExports.affectedExports);
        }
      });
    } else {
      i2e.forEach(({ affectedExports }
      ) => {
        markExports(marked, source, affectedExports)
      });
    }
    if (prev) {
      nodes.push(prev);
    }
  }
  return marked;
}
export default markDependents;
