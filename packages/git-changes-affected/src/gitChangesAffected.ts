import resolver from 'enhanced-resolve';
import huntAffected, { Affected } from 'hunt-affected';
import { ParserOptions } from '@babel/parser';
import _debug from 'debug';
import { getGitDiffs } from './getGitDiffs';
import IncludesFilePlugin from './includesFilePlugin';
import { GIT_OPERATION } from './constants';
import { Change } from './types';
import getRevisionFile from './getRevisionFile';
import denodeify from './denodeify';
import getTrackedFiles from './getTrackedFiles';
import hasExt from './hasExt';
import getAbsolutePath from './getAbsolutePath';
import getChangedEntries from './getChangedEntries';

const debug = _debug('git-changes-affected:affected');
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Find what module declarations will be affected by changing given code lines in given git revision context.
 * @param revision Git [revision](https://git-scm.com/docs/gitrevisions)
 * @param changes 
 * @param options 
 */
export function huntRevisionImpact(revision: string, changes: Change[], { alias, modules, parserOptions, paths }: Options): Promise<Affected> {
  debug(`${revision} changes: ${JSON.stringify(changes)}`);
  const extensions = DEFAULT_EXTENSIONS;
  const trackedFiles = getTrackedFiles(revision, paths).filter(file => hasExt(file, extensions)).map(getAbsolutePath);
  const entries = getChangedEntries(changes, parserOptions);
  debug(`${revision} entries: ${JSON.stringify(entries)}`);
  return huntAffected(
    trackedFiles,
    entries,
    {
      loader: (file: string) => Promise.resolve(getRevisionFile(revision, file)),
      resolver: denodeify(resolver.create({
        extensions,
        alias,
        modules,
        plugins: [new IncludesFilePlugin(trackedFiles, extensions)]
      })),
      parserOptions
    }
  );
}

type Options = {
  /** The end result revision. Default to `HEAD`. */
  to?: string,
  /** The revision to compare from. Default to one commit before `to` revision. */
  from?: string,
  /** Paths where to look for JS modules, if you have customised modules other than npm's `node_modules`. */
  modules?: string[],
  // extensions?: string[],
  /** Module alias to a path */
  alias?: { [alias: string]: string },
  /** `@babel/parser` options for parsing file to AST */
  parserOptions?: ParserOptions,
  /** Limit paths of tracked files to check with. By default it will check all the git tracked files. */
  paths?: string[]
};
/**
 * Compare 2 git revisions and find out what module declarations are affected by these changes.
 * @param opts 
 */
export default async function gitChangesAffected(opts: Options = {}): Promise<Affected> {
  const extensions = DEFAULT_EXTENSIONS;
  const to = opts.to || `HEAD`;
  const diffs = getGitDiffs(to, opts.from);
  const befores = [] as Change[];
  const afters = [] as Change[];
  diffs.forEach(({ source, target, operation }) => {
    if (
      operation !== GIT_OPERATION.new &&
      hasExt(source.file, extensions)
    ) {
      befores.push(source);
    }
    if (
      operation !== GIT_OPERATION.delete && 
      hasExt(target.file, extensions)
    ) {
      afters.push(target);
    }
  });
  const affected = await huntRevisionImpact(opts.from || `${to}~1`, befores, opts);
  debug('before affected:', affected);
  const toMerge = await huntRevisionImpact(to, afters, opts);
  debug('after affected:', toMerge);
  Object.keys(toMerge).forEach(mod => {
    const members = toMerge[mod];
    affected[mod] =affected[mod] ? new Set([
      ...Array.from(affected[mod]),
      ...Array.from(members)
    ]) : members;
  });
  return affected;
}