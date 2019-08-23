import path from 'path';
// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import _getEs6Dependents from '../src/es6Detect';
import resolveModulePath from '../src/resolveModulePath';

const FIXTURE_DIR = 'test/__fixtures__';

function getEs6Dependents(file: string, opts: any) {
  return _getEs6Dependents(path.resolve(FIXTURE_DIR, file), opts);
}

function resolveImports(mod: string) {
  return resolveModulePath(mod, path.resolve(FIXTURE_DIR, 'imports'));
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
    { inDetail: false, resolve: resolveImports },
    { inDetail: true, resolve: resolveImports }
  ])
);

function resolveExports(mod: string) {
  return resolveModulePath(mod, path.resolve(FIXTURE_DIR, 'exports'));
}
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
    { inDetail: false, resolve: resolveExports },
    { inDetail: true, resolve: resolveExports }
  ])
);
