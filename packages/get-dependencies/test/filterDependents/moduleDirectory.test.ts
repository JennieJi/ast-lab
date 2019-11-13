// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'module-directory'),
  configArgs()
  .arg('sources', [
    ['a.js', 'b.js'],
  ])
  .arg('targets', [
    { './a': ['default'] }
  ])
  .arg('options', [{
    moduleDirectory: ['../']
  }]),
  'module alias'
);