import path from 'path';
import { getExports, filterDependents } from 'get-dependencies';
import { getGitDiffs } from './getGitDiffs';
import exec from './exec';

async function gitRoot(){
  const { stdout, stderr } = await exec('git rev-parse --show-toplevel');
  if (stderr) {
    throw new Error(String(stderr));
  }
  return String(stdout);
}

async function gitChangesAffected(commit: string) {
  const diffs = await getGitDiffs(commit);
  diffs.forEach((_v, file) => {
    getExports(file, {
      resolve: async (relativePath: string) => {
        const root = await gitRoot();
        return path.resolve(root, relativePath);
      }
    });
  });
}
export default gitChangesAffected;