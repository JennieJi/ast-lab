import fs from 'fs';
import ecmaStats from 'es-stats';
import { Module, Member, Entry, Import, DependencyMap, AffectedMap, Options } from 'ast-lab-types';
import _debug from 'debug';
import { MODULE_ALL } from './constants';

const debug = _debug('get-dependencies:file');

function updateDependencyMap(depMap: DependencyMap, mod: Module, member: Member, entry: Entry[]): void {
  const affected  = depMap.get(mod) || new Map() as AffectedMap;
  if (!depMap.has(mod)) {
    depMap.set(mod, affected);
  }
  affected.set(member, entry);
}

/**
 * Get a file's dependency map
 * @param filePath {string} Absolute file path
 * @param options {object}
 * @prop options.loader {Loader} Read file content from absolute file path. Uses fs.readFileSync as utf8 by default.
 * @prop options.parserOptions {@babel/parser.options} Allow customize babel parser options while parsing file content to AST.
 * @return {Promise<DependencyMap>}
 */
export default async function fileDepMap(filePath: string, { loader, parserOptions }: Options = {}): Promise<DependencyMap> {
  const _loader = loader || ((_filePath: string) => Promise.resolve(fs.readFileSync(_filePath, 'utf8')));
  let file = await _loader(filePath);
  if (!file) {
    throw new Error(`${filePath} is empty!`)
  }
  const { imports: target, exports: entry, relations } = ecmaStats(file, parserOptions);
  debug('>>> ', filePath);
  debug('imports:', target);
  debug('exports:', entry);
  debug('relations:', relations);
  
  const depMap = new Map() as DependencyMap;
  const targetIndex = {} as { [key: string]: Import };

  target.forEach((ref) => {
    const { name, source, alias } = ref;
    targetIndex[alias] = ref;
    updateDependencyMap(depMap, source, name, [] as Entry[]);
  });

  if (entry.extends) {
    entry.extends.forEach((source) => {
      updateDependencyMap(depMap, source, MODULE_ALL, [{
        name: MODULE_ALL,
        source: filePath
      }]);
    })
  }

  debug('targetIndex:', targetIndex);
  debug('depMap initialized:', depMap);

  entry.members.forEach(({ name, alias }) => {
    const dependents = new Set() as Set<Import>;
    let dependsOn = relations[name];
    const toClear = new Set() as Set<string>;
    if (dependsOn) {
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
      relations[name] = dependsOn.filter(name => !toClear.has(name));
    }
    dependents.forEach(importRef => {
      debug('importRef > ', importRef);
      const affectedMap = depMap.get(importRef.source);
      const entries = affectedMap && affectedMap.get(importRef.name);
      if (entries) {
        entries.push({
          name: alias,
          source: filePath
        });
      }
    });
  });

  return depMap;
}
