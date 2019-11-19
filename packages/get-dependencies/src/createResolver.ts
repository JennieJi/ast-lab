import enhancedResolve, { ResolverFactory } from 'enhanced-resolve';
import path from 'path';

import isCore from './isCore';
import isThirdParty from './isThirdParty';

export default function createResolver(
  opts: ResolverFactory.ResolverOption = {}
) {
  return async (mod: string, source: string = '/'): Promise<string | void> => {
    if (!mod || isCore(mod)) {
      return;
    }
    if (path.isAbsolute(mod)) {
      return mod;
    }
    const basedir = path.dirname(source || '/');
    const result = await new Promise((resolve, reject) => 
      enhancedResolve.create(opts)(
        basedir, 
        mod, 
        (err: Error, res: string | undefined) => {
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
        }
      )
    ) as string | void;
    return result;
  }
}
