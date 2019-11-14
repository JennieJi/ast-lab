import exec from './exec';

export type Diff = {
  raw: string,
  offset: number,
  source: string,
  target: string,
  operation: GIT_OPERATION
};
export type Diffs = Map<string, Diff>;

export enum GIT_OPERATION {
  change = 0,
  new,
  delete,
  rename
};

function justifyOperation(operatelog: string) {
  if (/^new file mode/.test(operatelog)) {
    return GIT_OPERATION.new;
  }
  if (/^delete file mode/.test(operatelog)) {
    return GIT_OPERATION.delete;
  }
  /** @todo confirm rename similarity percentage */
  if (/^similarity index/.test(operatelog)) {
    return GIT_OPERATION.rename;
  }
  return GIT_OPERATION.change;
}

export function getGitDiffs(commit: string) {
  const stdout = exec(`git show ${commit} --format="%N" --first-parent`);
  const strOut = String(stdout);
  const diffs = new Map();
  let prevOffset = 0;
  let prevFile = '';
  strOut.replace(
    /\ndiff --git a\/([^\n\s]+) b\/([^\n\s]+)\n([^\n]+)\n/g, 
    (match, source: string, target: string, operatelog: string, offset: number) => {
    diffs.set(target, {
      offset,
      source,
      target,
      operation: justifyOperation(operatelog)
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