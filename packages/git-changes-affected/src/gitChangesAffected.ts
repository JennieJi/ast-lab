import { Affected } from 'hunt-affected';
import _debug from 'debug';
import huntRevisionImpact, {
  Options as HuntRevisionImpactOptions,
} from './huntRevisionImpact';
import getDiffEntries from './getDiffEntries';

const debug = _debug('git-changes-affected:affected');

export type Options = HuntRevisionImpactOptions & {
  /** The end result revision. Default to `HEAD`. */
  to?: string;
  /** The revision to compare from. Default to one commit before `to` revision. */
  from?: string;
};

/**
 * Compare 2 git revisions and find out what module declarations are affected by these changes.
 * @param opts
 */
export default async function gitChangesAffected(
  opts: Options = {}
): Promise<Affected> {
  const to = opts.to || `HEAD`;
  const from = opts.from || `${to}~1`;
  const { befores, afters } = getDiffEntries(opts);
  const affected = await huntRevisionImpact(from, befores, opts);
  debug('before affected:', affected);
  const toMerge = await huntRevisionImpact(to, afters, opts);
  debug('after affected:', toMerge);
  Object.keys(toMerge).forEach(mod => {
    const members = toMerge[mod];
    affected[mod] = affected[mod]
      ? new Set([...Array.from(affected[mod]), ...Array.from(members)])
      : members;
  });
  return affected;
}
