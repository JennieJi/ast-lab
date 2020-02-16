import path from 'path';
import glob from 'glob';
import { ParserPlugin } from '@babel/parser';
import { mergeDepMap } from 'hunt-affected';
import { Member } from 'ast-lab-types';

type Unused = { [module: string]: Array<Member> };

function getAbsolutePath(p: string): string {
  return path.resolve(process.cwd(), p);
}

type Options = {
  /** Source files glob */
  source?: string;
  /** Paths where to look for JS modules, if you have customised modules other than npm's `node_modules`. */
  modulePaths?: string[];
  // extensions?: string[],
  /** Module alias to a path */
  alias?: { [alias: string]: string };
  /** `@babel/parser` options for parsing file to AST */
  parserPlugins?: ParserPlugin[];
  /** Filter file extensions, default value: `['.js', '.jsx', '.ts', '.tsx]`. */
  extensions?: string[];
};

/**
 *
 * @param entries Exclude file entries that hunt unused cannot recognize
 * @param options
 */
export default async function huntUnused(
  entries = ['index.js', 'index.ts'],
  options: Options = {}
): Promise<Unused> {
  const { parserPlugins, modulePaths, alias, extensions, source } = options;
  const files = glob.sync(source || '**/*.js').map(getAbsolutePath);
  const excludeMap = new Set(
    (entries || [])
      .reduce((ret, ex) => {
        return ret.concat(glob.sync(ex));
      }, [] as string[])
      .map(getAbsolutePath)
  );
  const depMap = await mergeDepMap(files, {
    parserOptions: {
      plugins: parserPlugins,
    },
    resolverOptions: {
      extensions,
      alias,
      modules: modulePaths,
    },
  });
  const ret = {} as Unused;
  depMap.forEach((affectedMap, mod) => {
    if (excludeMap.has(mod)) {
      return;
    }
    const unusedMembers = [] as Member[];
    for (const [member, entries] of affectedMap) {
      if (member === '*' && entries.length) {
        return;
      }
      if (!entries.length) {
        unusedMembers.push(member);
      }
    }
    if (affectedMap.size === unusedMembers.length) {
      ret[mod] = ['*'];
    } else {
      ret[mod] = unusedMembers;
    }
  });
  return ret;
}
