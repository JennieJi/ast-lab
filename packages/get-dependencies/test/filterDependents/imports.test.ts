// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'imports'),
  configArgs()
  .arg('sources', [
    ['base.js'],
    ['base.js', 'importAlias.js'],
    ['base.js', 'importAll.js'],
    ['base.js', 'importDefault.js'],
    ['base.js', 'importNamed.js'],
    ['base.js', 'noImports.js'],
    ['base.js', 'importCss.js']
  ])
  .arg('targets', [
    { './base': ['a', 'default'] }
  ]),
  'imports'
);