// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import _markDependents from '../src/markDependents';
import { Exports, PathNode, ModuleExported } from 'ast-lab-types';
import { ALL_EXPORTS, ALL_MODULES } from '../src/constants';

function makeSimplePath(paths: string[]) {
  let root = null as PathNode | null;
  return paths.reduce((ret, p, i) => {
    const source =  paths[i - 1] || null;
    root = {
      source,
      importModule: p,
      i2e: new Map([
        [ALL_MODULES, {
          alias: 'ImportAlias',
          affectedExports: ALL_EXPORTS
        }]
      ]),
      prev: root
    };
    ret.set(p, root);
    return ret;
  }, new Map());
}
function objToMap(obj: { [key: string]: ModuleExported }): Exports {
  return new Map(Object.keys(obj).map(key => [key, obj[key]]));
}
function markDependents(marked: { [key: string]: ModuleExported }, paths: string[]) {
  return _markDependents(
    objToMap(marked), 
    makeSimplePath(paths)
  );
}

describe('markDependents()', () => {
  const rootNode = {
    source: 'root',
    importModule: 'm2',
    i2e: null,
    prev: null
  };
  test('should not mark if end node is not marked', () => {
    expect(
      _markDependents(
        new Map([['m2', true]]),
        new Map().set(
          'm3',
          [{
            source: 'm2',
            importModule: 'm3',
            i2e: new Map([
              ['default', {
                alias: 'alias',
                affectedExports: ALL_EXPORTS
              }]
            ]),
            prev: rootNode
          }]
        ),
      )
    ).toMatchSnapshot();
  });
  enumerateArgsTestFunction(
    markDependents,
    configArgs()
    .arg('marked', [
      { m2: true }
    ])
    .arg('pathNode', [
      ['m1', 'm2', 'm3', 'm4'],
      ['m1', 'm2', 'm3']
    ]),
    'should not mark if end node is not marked'
  );
  enumerateArgsTestFunction(
    markDependents,
    configArgs()
    .arg('marked', [
      { m4: true }
    ])
    .arg('pathNode', [
      ['m1', 'm2', 'm3', 'm4'],
      ['b1', 'b2', 'm4'],
    ]),
    'should mark all paths given'
  );
});
