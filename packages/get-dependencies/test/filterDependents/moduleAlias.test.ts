// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'module-alias'),
  configArgs()
  .arg('sources', [
    ['./a.js', 'unrelated-folder.js'],
    ['./a.js', 'unrelated-name.js'],
  ])
  .arg('targets', [
    { './a': ['default'] }
  ])
  .arg('options', [{
    alias: {
      'alias-folder': './',
      'alias-a': './a'
    }
  }]),
  'module alias'
);