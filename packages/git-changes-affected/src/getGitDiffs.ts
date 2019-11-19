  offset: number,
  source: string,
  target: string,
  operation: GIT_OPERATION
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
  /** @todo confirm rename similarity percentage */
  if (/^similarity index/.test(operatelog)) {
    return GIT_OPERATION.rename;
  }
  return GIT_OPERATION.change;
}

export function getGitDiffs(commit: string) {
  const stdout = exec(`git show ${commit} --format="%N" --first-parent`);
  strOut.replace(
    /\ndiff --git a\/([^\n\s]+) b\/([^\n\s]+)\n([^\n]+)\n/g, 
    (match, source: string, target: string, operatelog: string, offset: number) => {
      source,
      target,
      operation: justifyOperation(operatelog)