import exec from './exec';

export type Diff = {
  raw: string,
};

export async function getGitDiffs(commit: string) {
  const { stdout, stderr } = await exec(`git show ${commit} --format="%N" --first-parent`);
  if (stderr) {
    throw new Error(String(stderr));
  }
  const strOut = String(stdout);
  const diffs = new Map();
  let prevOffset = 0;
  let prevFile = '';
  strOut.replace(/\ndiff --git a\/([^\n\s]+) b\/([^\n\s]+)/g, (match, source: string, target: string, offset: number) => {
    diffs.set(target, {
      offset,
      source
    });
    if (prevFile) {
      diffs.set(prevFile, {
        ...diffs.get(prevFile),
        raw: strOut.substring(prevOffset, offset)
      });
    }
    prevFile = target;
    prevOffset = offset;
    return match;
  });
  diffs.set(prevFile, {
    ...diffs.get(prevFile),
    raw: strOut.substring(prevOffset)
  });
  return diffs;
}

export default getGitDiffs;