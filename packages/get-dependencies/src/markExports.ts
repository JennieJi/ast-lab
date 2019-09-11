import { ALL_EXPORTS } from './constants';
import { ModuleExported, Exports, Exported } from './types';

function markExports(marked: Exports, source: string, markExports: ModuleExported) {
  const markedMod = marked.get(source);
  const isLimitedExport = markExports instanceof Set;
  if (!markedMod) {
    return marked.set(
      source,
      isLimitedExport ? new Set(Array.from(markExports as Set<Exported>)): markExports
    );
  } else if (markedMod !== ALL_EXPORTS) {
    if (markExports === ALL_EXPORTS) {
      return marked.set(source, ALL_EXPORTS);
    } else if (isLimitedExport) {
      const updatedExports = Array.from(markedMod);
      (markExports as Set<Exported>).forEach(v => {
        if (!markedMod.has(v)) {
          updatedExports.push(v);
        }
      });
      // create new Set for easier comparing
      if (updatedExports.length !== markedMod.size) {
        return marked.set(source, new Set(updatedExports));
      }
    } 
  }
  return marked;
}

export default markExports;
