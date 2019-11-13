import enhancedResolve from 'enhanced-resolve';
import path from 'path';

import isCore from './isCore';
import isThirdParty from './isThirdParty';
import { Options } from './types';

export default async function resolveModulePath(mod: string, basedir: string, { alias, moduleDirectory: modules, extensions }: Options = {}): Promise<string | void> {
  if (!mod || isCore(mod)) {
    return;
  }
  if (path.isAbsolute(mod)) {
    return mod;
  }
  const resolver = enhancedResolve.create({
    extensions: extensions,
    modules,
    alias
  });
  const result = await new Promise((resolve, reject) => resolver(basedir, mod, (err: Error, res: string | undefined) => {
    if (err) {
      console.warn(err);
      return reject(err);
    }
    if (!res) {
      console.log(`Couldn't find module ${mod}!`);
      return resolve();
    }
    if (isThirdParty(res)) {
      return resolve();
    }
    return resolve(res);
  })) as string | void;
  return result;
}
