import enhancedResolve from 'enhanced-resolve';
import path from 'path';

import isCore from './isCore';
import isThirdParty from './isThirdParty';
import { Alias } from './types';

type ResolveOptions = {
  alias?: Alias,
  moduleDirectory?: string[],
  extensions?: string[],
  plugins?: any[]
}

export default async function resolveModulePath(
  mod: string, 
  source: string, 
  { 
    alias, 
    moduleDirectory: modules, 
    extensions,
    plugins
  }: ResolveOptions = {}
): Promise<string | void> {
  if (!mod || isCore(mod)) {
    return;
  }
  if (path.isAbsolute(mod)) {
    return mod;
  }
  const resolver = enhancedResolve.create({
    extensions: extensions,
    modules,
    alias,
    plugins
  });
  const basedir = path.dirname(source);
  const result = await new Promise((resolve, reject) => resolver(basedir, mod, (err: Error, res: string | undefined) => {
    if (err) {
      return reject(err.message);
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
