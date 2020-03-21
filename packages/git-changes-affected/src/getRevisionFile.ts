import path from 'path';
import exec from './exec';
import gitRoot from './gitRoot';

const ROOT = gitRoot();
function getRelativePath(file: string): string {
  return path.isAbsolute(file) ? path.relative(ROOT, file) : file;
}

/** @internal */
export default function getRevisionFile(
  revision: string,
  file: string
): string {
  return exec(`git show ${revision}:${getRelativePath(file)}`);
}
