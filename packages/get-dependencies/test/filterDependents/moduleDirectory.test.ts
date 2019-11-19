// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';
import resolveModulePath from '../../src/createResolver';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'module-directory'),
  configArgs()
  .arg('sources', [
    ['a.js', 'b.js'],
  ])
  .arg('targets', [
    { './a': ['default'] }
  ])
  .arg('options', [
    {
      resolver: resolveModulePath({
        modules: ['../']
      })
    }
  ]),
  'module alias'
);