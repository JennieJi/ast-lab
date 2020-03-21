import { Affected } from 'hunt-affected';
import {
  huntRevisionImpact,
  getDiffEntries,
  ParserOptions,
} from 'git-changes-affected';

function mergeAffected(base: Affected, toMerge: Affected): void {
  Object.keys(toMerge).forEach(mod => {
    const members = toMerge[mod];
    base[mod] = base[mod]
      ? new Set([...Array.from(base[mod]), ...Array.from(members)])
      : members;
  });
}

export type Revisions = {
  /** The end result revision. Default to `HEAD`. */
  to?: string;
  /** The revision to compare from. Default to one commit before `to` revision. */
  from?: string;
};

export default async function gitChangesAffected(
  resolves: Array<{
    /** Limit paths of tracked files to check with. By default it will check all the git tracked files. */
    paths: string[];
    /** Paths where to look for JS modules, if you have customised modules other than npm's `node_modules`. */
    modules?: string[];
    // extensions?: string[],
    /** Module alias to a path */
    alias?: { [alias: string]: string };
    /** `@babel/parser` options for parsing file to AST */
    parserOptions?: ParserOptions;
    /** Filter file extensions, eg. `['.js', '.jsx', '.ts', '.tsx]`. */
    extensions?: string[];
  }>,
  opts: Revisions = {}
): ReturnType<typeof huntRevisionImpact> {
  const to = opts.to || `HEAD`;
  const from = opts.from || `${to}~1`;
  const { befores, afters } = getDiffEntries(opts);
  const affected = {} as Affected;
  await Promise.all(
    resolves.map(async resolveOptions => {
      mergeAffected(
        affected,
        await huntRevisionImpact(from, befores, resolveOptions)
      );
      mergeAffected(
        affected,
        await huntRevisionImpact(to, afters, resolveOptions)
      );
    })
  );
  return affected;
}
