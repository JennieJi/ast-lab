import path from 'path';
import fs from 'fs';
// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import _getEs6Dependents from '../src/es6Detect/getEs6Dependents';
import resolveModulePath from '../src/createResolver';

const FIXTURE_DIR = 'test/__fixtures__';
const getPath = (file: string) => path.resolve(FIXTURE_DIR, file);
function getEs6Dependents(file: string, opts: any) {
  return _getEs6Dependents(getPath(file), opts);
}

function loader(dir: string) {
  return async (mod: string) => {
    const realpath = await resolveModulePath()(mod, getPath(`${dir}/index`));
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
    'imports/importDeeperPath.js',
    'imports/noImports.js',
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
