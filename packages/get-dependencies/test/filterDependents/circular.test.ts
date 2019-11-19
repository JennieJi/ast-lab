// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';
import createResolver from '../../src/createResolver';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'circular'),
  configArgs()
  .arg('sources', [
    ['a.js', 'b.js', 'c.js'],
  ])
  .arg('targets', [
    { './a': ['default'] }
  ])
  .arg('options', [
    {
      resolver: createResolver({
        modules: ['../']
      })
    }
  ]),
  'circular'
);