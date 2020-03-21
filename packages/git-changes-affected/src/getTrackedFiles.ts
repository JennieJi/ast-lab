import exec from './exec';
import gitRoot from './gitRoot';

const root = gitRoot();

/**
 * @param revision Git revision.
 * @param paths Glob path expression for filtering files
 */
export default function getTrackedFiles(
  revision = 'HEAD',
  paths?: string[]
): string[] {
  const pathsInCmd = paths && paths.length ? paths.join(' ') : root;
  const raw = exec(
    `git ls-tree -r ${revision} --name-only --full-name ${pathsInCmd}`
  );
  return raw.split('\n');
}
