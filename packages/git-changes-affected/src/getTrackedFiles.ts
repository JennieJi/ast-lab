import exec from './exec';
import gitRoot from './gitRoot';

const root = gitRoot();

/** @internal */
export default function getTrackedFiles(revision: string = 'HEAD', paths?: string[]) {
  const pathsInCmd = paths && paths.length ? paths.join(' ') : root;
  const raw = exec(`git ls-tree -r ${revision} --name-only --full-name ${pathsInCmd}`);
  return raw.split('\n');
}