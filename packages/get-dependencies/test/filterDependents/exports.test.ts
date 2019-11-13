// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import { filterDependents } from './utils';

enumerateArgsTestFunction(
  filterDependents.bind(null, 'exports'),
  configArgs()
  .arg('sources', [
    ['./exportNamed.js', './exportDefault.js', 'exportAllFrom.js'],
    ['./exportNamed.js', './exportDefault.js',],
    ['./exportNamed.js', './exportDefault.js', 'exportDefaultAliasFrom.js'],
    ['./exportNamed.js', './exportDefault.js', 'exportNamedFrom.js'],
    ['./exportNamed.js', './exportDefault.js', 'noExports.js']
  ])
  .arg('targets', [
    { './exportNamed': ['a'] },
    { './exportDefault': ['default'] }
  ]),
  'exports from'
);