import path from 'path';
import fs from 'fs';
// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import _getEs6Dependents from '../src/es6Detect/getEs6Dependents';
import resolveModulePath from '../src/resolveModulePath';

const FIXTURE_DIR = 'test/__fixtures__';

function getEs6Dependents(file: string, opts: any) {
  return _getEs6Dependents(path.resolve(FIXTURE_DIR, file), opts);
}

function loader(dir: string) {
  return (mod: string) => {
    const realpath = resolveModulePath(mod, path.resolve(FIXTURE_DIR, dir));
    return realpath ? fs.readFileSync(realpath, 'utf-8') : '';
  };
}
enumerateArgsTestFunction(
  getEs6Dependents,
  configArgs()
  .arg('source', [
    'imports/importNamed.js',
    'imports/importAlias.js',
    'imports/importAll.js',
    'imports/importDefault.js',
  ])
  .arg('opts', [
    { inDetail: false, loader: loader('imports') },
    { inDetail: true,  loader: loader('imports') }
  ])
);

enumerateArgsTestFunction(
  getEs6Dependents,
  configArgs()
  .arg('source', [
    'exports/exportAllFrom.js',
    'exports/exportDefaultAliasFrom.js',
    'exports/exportNamedFrom.js',
    'exports/noExports.js'
  ])
  .arg('opts', [
    { inDetail: false,  loader: loader('exports') },
    { inDetail: true,  loader: loader('exports') }
  ])
);
