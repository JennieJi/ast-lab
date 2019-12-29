import resolver from 'enhanced-resolve';
import huntAffected from 'hunt-affected';
import { ParserOptions } from '@babel/parser';
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


const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function changesAffected(commit: string, changes: Change[], { alias, modules, parserOptions }: Options) {
  const extensions = DEFAULT_EXTENSIONS;
  const trackedFiles = getTrackedFiles(commit).filter(file => hasExt(file, extensions)).map(getAbsolutePath);
  return huntAffected(
    trackedFiles,
    getChangedEntries(changes, parserOptions),
    {
      loader: (file: string) => Promise.resolve(getRevisionFile(commit, file)),
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
  modules?: string[],
  // extensions?: string[],
  alias?: { [alias: string]: string },
  parserOptions?: ParserOptions
};
export default async function gitChangesAffected(commit: string, opts: Options) {
  const extensions = DEFAULT_EXTENSIONS;
  const diffs = getGitDiffs(commit);
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
  const affected = await changesAffected( `${commit}~1`, befores, opts);
  const toMerge = await changesAffected( commit, afters, opts);
  Object.keys(toMerge).forEach(mod => {
    const members = toMerge[mod];
    affected[mod] =affected[mod] ? new Set(
      ...Array.from(affected[mod]),
      ...Array.from(members)
    ) : members;
  });
  return affected;
}