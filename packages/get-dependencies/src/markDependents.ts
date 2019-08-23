import markExports from './markExports';
import { Exports, PathNode } from './types';
import { ALL_MODULES } from './constants';

function markDependents(marked: Exports, pathNode: PathNode) {
  const { source, importModule, i2e, prev } = pathNode;
  if (!source || !i2e || !marked.has(importModule)) {
    return marked;
  }
  const markedExported = marked.get(importModule);
  if (markedExported) {
    /** @todo remove this temp workaround logic */
    const importAll = i2e.get(ALL_MODULES);
    if (importAll) {
      markExports(marked, source, importAll.affectedExports);
    } else if (markedExported instanceof Set) {
      markedExported.forEach(exported => {
        const affectedSourceExports = i2e.get(exported);
        if (!affectedSourceExports) { return; }
        markExports(marked, source, affectedSourceExports.affectedExports);
      });
    } else {
      i2e.forEach(({ affectedExports }
      ) => {
        markExports(marked, source, affectedExports)
      });
    }
    if (prev) {
      markDependents(marked, prev);
    }
  }
  return marked;
}
export default markDependents;
