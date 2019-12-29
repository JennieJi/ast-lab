import exec from './exec';
import { GIT_OPERATION } from './constants';
import { Diff } from './types';
import getRevisionFile from './getRevisionFile';

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
function isLineRemoved(content: string) {
  return content.startsWith('-');
}
function isLineAdded(content: string) {
  return content.startsWith('+');
}

/**
 * @todo get real diff content
 * @param {string} commit 
 */
export function getGitDiffs(commit: string): Diff[] {
  const strOut = exec(`git show ${commit} --format="%N" --first-parent`);
  const diffs = [] as Diff[];
  let lineA = 0;
  let lineB = 0;
  let aChangeStart = null as number | null;
  let bChangeStart = null as number | null;
  const diffLines = strOut.split('\n')
  diffLines.forEach((content, index) => {
    const lastDiff = diffs[diffs.length - 1];
    const aChanges = lastDiff &&lastDiff.source.changed;
    const bChanges = lastDiff &&lastDiff.target.changed;
    const fileHeadMatch = content.match(/^diff --git a\/([^\n\s]+) b\/([^\n\s]+)/);
    if (fileHeadMatch) {
      if (lastDiff) {
        if (
          lastDiff.operation !== GIT_OPERATION.rename && 
          aChangeStart !== null
        ) {
          aChanges.push({ 
            start: aChangeStart,
            end: lineA - 1
          });
        }
        if (bChangeStart !== null) {
          bChanges.push({
            start: bChangeStart, 
            end: lineB - 1
          });
        }
      }
      const [sourceFile, targetFile] = fileHeadMatch.slice(1);
      const operation = justifyOperation(diffLines[index + 1]);
      diffs.push({
        source: {
          file: sourceFile,
          content: operation === GIT_OPERATION.new ? null : getRevisionFile(`${commit}~1`, sourceFile),
          changed: operation === GIT_OPERATION.rename ? [{
            start: 0, 
            end: Infinity
          }]: []
        },
        target: {
          file: targetFile,
          content:  operation === GIT_OPERATION.delete ? null : getRevisionFile(commit, targetFile),
          changed: []
        },
        operation,
      });
      return;
    }
    const chunkHeadMatch = content.match(/@@ -(\d+),\d+ \+(\d+),\d+ @@/);
    if (chunkHeadMatch) {
      lineA = parseInt(chunkHeadMatch[1], 10);
      lineB = parseInt(chunkHeadMatch[2], 10);
      return;
    }
    const isLastLine = index === diffLines.length - 1;
    const isAdded = isLineAdded(content);
    const isRemoved = isLineRemoved(content);
    if (
      lastDiff.operation !== GIT_OPERATION.rename
    ) {
      if (isRemoved && aChangeStart === null) {
        aChangeStart = lineA;
      }
      if (
        (!isRemoved || isLastLine) && aChangeStart !== null
      ) {
        aChanges.push({ 
          start: aChangeStart,
          end: lineA - 1
        });
        aChangeStart = null;
      }
      if (!isAdded) {
        lineA++;
      }
    }
    if (isAdded && bChangeStart === null) {
      bChangeStart = lineB;
    }
    if (
      (!isAdded || isLastLine) && 
      bChangeStart !== null
    ) {
      bChanges.push({
        start: bChangeStart, 
        end: lineB - 1
      });
      bChangeStart = null;
    }
    if (!isRemoved) {
      lineB++;
    }
  });
  return diffs;
}

export default getGitDiffs;