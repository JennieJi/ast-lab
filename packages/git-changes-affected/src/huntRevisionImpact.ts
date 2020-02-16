import huntAffected, { Affected } from 'hunt-affected';
import _debug from 'debug';
import { ParserOptions } from '@babel/parser';
import IncludesFilePlugin from './includesFilePlugin';
import getRevisionFile from './getRevisionFile';
import getTrackedFiles from './getTrackedFiles';
import getAbsolutePath from './getAbsolutePath';
import getChangedEntries from './getChangedEntries';
import { Change } from './types';
import { DEFAULT_EXTENSIONS } from './constants';
import hasExt from './hasExt';

export type Options = {
  /** Paths where to look for JS modules, if you have customised modules other than npm's `node_modules`. */
  modules?: string[];
  // extensions?: string[],
  /** Module alias to a path */
  alias?: { [alias: string]: string };
  /** `@babel/parser` options for parsing file to AST */
  parserOptions?: ParserOptions;
  /** Limit paths of tracked files to check with. By default it will check all the git tracked files. */
  paths?: string[];
  /** Filter file extensions, default value: `['.js', '.jsx', '.ts', '.tsx]`. */
  extensions?: string[];
};

const debug = _debug('git-changes-affected:revision-impact');
/**
 * Find what module declarations will be affected by changing given code lines in given git revision context.
 * @param revision Git [revision](https://git-scm.com/docs/gitrevisions)
 * @param changes
 * @param options
 */
export default function huntRevisionImpact(
  revision: string,
  changes: Change[],
  { alias, modules, parserOptions, paths, extensions }: Options
): Promise<Affected> {
  const _extensions = extensions || DEFAULT_EXTENSIONS;
  debug(`${revision} changes: ${JSON.stringify(changes)}`);
  const trackedFiles = getTrackedFiles(revision, paths)
    .filter(file => hasExt(file, _extensions))
    .map(getAbsolutePath);
  const entries = getChangedEntries(changes, parserOptions);
  debug(`${revision} entries: ${JSON.stringify(entries)}`);
  return huntAffected(trackedFiles, entries, {
    loader: (file: string) => Promise.resolve(getRevisionFile(revision, file)),
    resolverOptions: {
      extensions: _extensions,
      alias,
      modules,
      plugins: [new IncludesFilePlugin(trackedFiles, extensions)],
    },
    parserOptions,
  });
}
