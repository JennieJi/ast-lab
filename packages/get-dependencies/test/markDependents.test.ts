// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import _markDependents from '../src/markDependents';
import { Exports, PathNode } from '../src/types';
import { ALL_EXPORTS, ALL_MODULES } from '../src/constants';

function makeSimplePath(paths: string[]) {
  return paths.reduce((ret, p, i) => {
    if (i === paths.length - 1) {
      return ret;
    }
    return {
      source: p,
      importModule: paths[i + 1],
      i2e: new Map([
        [ALL_MODULES, {
          alias: 'ImportAlias',
          affectedExports: ALL_EXPORTS
        }]
      ]),
      prev: ret
    };
  }, {} as PathNode);
}
function markDependents(marked: Exports, paths: string[]) {
  return _markDependents(marked, makeSimplePath(paths));
}

describe('markDependents()', () => {
  const rootNode = {
    source: 'root',
    importModule: 'm2',
    i2e: null,
    prev: null
  };
  enumerateArgsTestFunction(
    _markDependents,
    configArgs()
    .arg('marked', [new Map([
      ['m2', true]
    ])])
    .arg('pathNode', [
      {
        source: 'import-default',
        importModule: 'm2',
        i2e: new Map([
          ['default', {
            alias: 'alias',
            affectedExports: ALL_EXPORTS
          }]
        ]),
        prev: rootNode
      }
    ]),
    'should not mark if end node is not marked'
  );
  enumerateArgsTestFunction(
    markDependents,
    configArgs()
    .arg('marked', [new Map([
      ['m2', true]
    ])])
    .arg('pathNode', [
      ['m1', 'm2', 'm3', 'm4'],
      ['m1', 'm2', 'm3']
    ]),
    'should not mark if end node is not marked'
  );
  enumerateArgsTestFunction(
    markDependents,
    configArgs()
    .arg('marked', [new Map([
      ['m4', true]
    ])])
    .arg('pathNode', [
      ['m1', 'm2', 'm3', 'm4'],
      ['b1', 'b2', 'm2'],
    ]),
    'should mark all paths given'
  );
});
