import resolve from 'resolve';
import fs from 'fs';

import replaceAlias from './replaceAlias';
import isCore from './isCore';
import isThirdParty from './isThirdParty';
import isRealFile from './isRealFile';
import { Options } from './types';

export default function resolveModulePath(mod: string, basedir: string, { alias, moduleDirectory, extensions }: Options = {}): string | void {
  if (!mod || isCore(mod)) {
    return;
  }
  if (isRealFile(mod)) {
    return mod;
  }
  if (alias) {
    mod = replaceAlias(alias)(mod);
  }
  try {
    const result = resolve.sync(mod, {
      moduleDirectory,
      basedir,
      extensions: extensions || ['.js', '.jsx', '.ts', '.tsx'],
    });

    if (!result) {
      console.log(`Couldn't find module ${mod}!`)
      return;
    }
    if (isThirdParty(result) || !isRealFile(result)) {
      return;
    }
    return fs.realpathSync(result);
  } catch(err) {
    console.log(err);
    return;
  }
}
