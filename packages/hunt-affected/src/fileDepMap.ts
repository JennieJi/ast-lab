import fs from 'fs';
import ecmaStats from 'es-stats';
import { Entry, Import, DependencyMap } from 'ast-lab-types';
import _debug from 'debug';
import appendEntries from './appendEntries';
import { MODULE_ALL } from './constants';
import { Options } from './types';

const debug = _debug('hunt-affected:file');
const dynamicImportReg = /[^#]+#/;

/**
 * Get a file's dependency map
 * @param filePath Absolute file path
 * @param options
 */
export default async function fileDepMap(filePath: string, { loader, parserOptions }: Options = {}): Promise<DependencyMap> {
  const depMap = new Map() as DependencyMap;
  const _loader = loader || ((_filePath: string) => Promise.resolve(fs.readFileSync(_filePath, 'utf8')));
  let file;
  try {
    file = await _loader(filePath);
    if (!file) {
      console.warn(`${filePath} is empty!`);
      return depMap;
    }
  } catch(e) {
    console.warn(`Failed to load file ${filePath}!`);
    return depMap;
  }
  let fileStats;
  try { 
    fileStats = ecmaStats(file, parserOptions);
  } catch(e) {
    console.warn(`get es stats from ${filePath} failed! Parser options: ${JSON.stringify(parserOptions)}`);
    console.warn(e);
    return depMap;
  }
  const { imports: target, exports: entry, relations } = fileStats;
  debug('>>> ', filePath);
  debug('imports:', target);
  debug('exports:', entry);
  debug('relations:', relations);
  
  const dynamicImportRenameQueue = [] as Array<Import>;
  const targetIndex = {} as { [key: string]: Import };
  target.forEach((ref) => {
    const { name, source, alias } = ref;
    targetIndex[alias] = ref;
    appendEntries(depMap, source, name, [] as Entry[]);
    if (dynamicImportReg.test(name)) {
      dynamicImportRenameQueue.push(ref);
    }
  });

  if (entry.extends) {
    entry.extends.forEach((source) => {
      appendEntries(depMap, source, MODULE_ALL, [{
        name: MODULE_ALL,
        source: filePath
      }]);
    })
  }

  debug('targetIndex:', targetIndex);
  debug('depMap initialized:', depMap);

  entry.members.forEach(({ alias }) => {
    const dependents = new Set() as Set<Import>;
    let dependsOn = relations[alias];
    if (dependsOn) {
      dependsOn.push(alias);
    } else {
      dependsOn = [alias];
    }
    const toClear = new Set() as Set<string>;
    dependsOn.forEach(dependent => {
      const importRef = targetIndex[dependent];
      if (importRef) {
        dependents.add(importRef);
      } else if (relations[dependent]) {
        dependsOn = dependsOn.concat(relations[dependent]);
        toClear.add(dependent);
      }
    });
    /** @todo verify whether this helps for performance */
    relations[alias] = dependsOn.filter(name => !toClear.has(name));

    dependents.forEach(importRef => {
      debug('importRef: ', importRef);
      appendEntries(depMap, importRef.source, importRef.name, [{
        name: alias,
        source: filePath
      }]);
    });

    // Dynamic import has special format name to avoid conflict
    // But this is not needed in file dep map
    dynamicImportRenameQueue.forEach(({ source, name }) => {
      const affectedMap = depMap.get(source);
      const entries = affectedMap && affectedMap.get(name);
      if (!affectedMap || !entries) { return; }
      const renameTo = name.replace(dynamicImportReg, '');
      appendEntries(depMap, source, renameTo, entries);
      affectedMap.delete(name);
    });

    // Add its own exports to the depMap
    appendEntries(depMap, filePath, alias, []);
  });
  debug('depMap', depMap);

  return depMap;
}
