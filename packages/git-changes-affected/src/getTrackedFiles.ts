import exec from './exec';
import gitRoot from './gitRoot';

export default function getTrackedFiles(revision: string = 'HEAD', paths?: string[]) {
  const pathsInCmd = paths &&paths.length ? paths.join(' ') : gitRoot();
  const raw = exec(`git ls-tree -r ${revision} --name-only --full-name ${pathsInCmd}`);
  return raw.split('\n');
}