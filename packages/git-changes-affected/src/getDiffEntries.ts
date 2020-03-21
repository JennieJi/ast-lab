import { getGitDiffs } from './getGitDiffs';
import { GIT_OPERATION } from './constants';
import { Change } from './types';

export default function getDiffEntries(opts: {
  /** The end result revision. Default to `HEAD`. */
  to?: string;
  /** The revision to compare from. Default to one commit before `to` revision. */
  from?: string;
}): {
  befores: Change[];
  afters: Change[];
} {
  const to = opts.to || `HEAD`;
  const from = opts.from || `${to}~1`;
  const diffs = getGitDiffs(to, from);
  const befores = [] as Change[];
  const afters = [] as Change[];
  diffs.forEach(({ source, target, operation }) => {
    if (operation !== GIT_OPERATION.new) {
      befores.push(source);
    }
    if (operation !== GIT_OPERATION.delete) {
      afters.push(target);
    }
  });
  return {
    befores,
    afters,
  };
}
