import { ALL_EXPORTS } from './constants';
import { ModuleExported, Exports, Exported } from './types';

function markExports(marked: Exports, source: string, markExports: ModuleExported) {
  const markedMod = marked.get(source);
  const isLimitedExport = markExports instanceof Set;
  if (!markedMod) {
    marked.set(
      source,
      isLimitedExport ? new Set(Array.from(markExports as Set<Exported>)): markExports
    );
  } else if (markedMod !== ALL_EXPORTS) {
    if (isLimitedExport) {
      (markExports as Set<Exported>).forEach(v => markedMod.add(v));
    } else if (markExports === ALL_EXPORTS) {
      marked.set(source, ALL_EXPORTS);
    }
  }
  return marked;
}

export default markExports;
