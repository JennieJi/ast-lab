// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'circular'),
  configArgs()
  .arg('sources', [
    ['a.js', 'b.js', 'c.js'],
  ])
  .arg('targets', [
    { './a': ['default'] }
  ])
  .arg('options', [{
    moduleDirectory: ['../']
  }]),
  'circular'
);