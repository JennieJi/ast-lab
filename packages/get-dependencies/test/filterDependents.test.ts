import path from 'path';
import resolve from 'resolve';
// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import _filterDependents from '../src/filterDependents';

const FIXTURE_DIR = 'test/__fixtures__';
const resolvePath = (file: string) => path.resolve(FIXTURE_DIR, file);

function filterDependents(
  basedir: string,
  sources: string[],
  imports: {
    [mod: string]: string[]
  },
  ...args: any[]
) {
  return _filterDependents(
    sources.map(s => resolvePath(path.join(basedir, s))),
    makeTargets(basedir, imports),
    ...args
  ).map(absolute => absolute.replace(__dirname, ''));
}
function makeTargets(basedir: string, data: {
  [mod: string]: string[]
}) {
  return new Map( Object.keys(data).map(mod => {
    return [
      resolve.sync(mod, { basedir: path.resolve(FIXTURE_DIR, basedir) }),
      new Set(data[mod])
    ];
  }));
}

describe('filterDependents()', () => {
  enumerateArgsTestFunction(
    filterDependents.bind(null, 'imports'),
    configArgs()
    .arg('sources', [
      ['base.js'],
      ['importAlias.js'],
      ['importAll.js'],
      ['importDefault.js'],
      ['importNamed.js'],
      ['noImports.js']
    ])
    .arg('targets', [
      { './base': ['a', 'default'] }
    ]),
    'imports'
  );

  enumerateArgsTestFunction(
    filterDependents.bind(null, 'exports'),
    configArgs()
    .arg('sources', [
      ['exportAllFrom.js'],
      ['exportDefault.js'],
      ['exportDefaultAliasFrom.js'],
      ['exportNamedFrom.js'],
      ['noExports.js']
    ])
    .arg('targets', [
      { './exportNamed': ['a'] },
      { './exportDefault': ['default'] }
    ]),
    'exports from'
  );

  enumerateArgsTestFunction(
    filterDependents.bind(null, 'module-alias'),
    configArgs()
    .arg('sources', [
      ['unrelated-folder.js'],
      ['unrelated-name.js'],
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
});
