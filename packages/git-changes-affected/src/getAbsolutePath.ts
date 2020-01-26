import path from 'path';
import exec from './exec';

const gitRoot = exec('git rev-parse --show-toplevel');
/** @internal */
export default function getAbsolutePath(relativePath: string) {
  return path.resolve(gitRoot, relativePath);
}