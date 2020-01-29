import _debug from 'debug';
const debug = _debug('git-changes-affected:diff');

 * Compare 2 git revisions and get an object refelcting the changes.
 * @param to Git revision.
 * @param from Git revision.
export function getGitDiffs(to: string, from?: string): Diff[] {
  from = from || `${to}~1`;
  const strOut = exec(`git diff ${from} ${to}`);
  const diffLines = strOut.split('\n');
  debug(`>>> ${from}...${to}`);

    const fileHeadMatch = content.match(
      /^diff --git a\/([^\n\s]+) b\/([^\n\s]+)/
    );
    const chunkHeadMatch = content.match(
      /@@ -(\d+)(,\d+)? \+(\d+)(,\d+)? @@( .+)?/
    );
    const isLastLine =
      index === diffLines.length - 1 || !!fileHeadMatch || !!chunkHeadMatch;
    const isAdded = isLineAdded(content);
    const isRemoved = isLineRemoved(content);
    debug(
      `${from}...${to} ${content} > ${(fileHeadMatch &&
        fileHeadMatch.slice(1)) ||
        (chunkHeadMatch &&
          chunkHeadMatch.slice(
            1
          ))} | last line: ${isLastLine} | ${isRemoved}, ${isAdded} | ${lastDiff &&
        lastDiff.operation}`
    );

    if (lastDiff) {
      const aChanges = lastDiff.source.changed;
      const bChanges = lastDiff.target.changed;
      if (lastDiff.operation !== GIT_OPERATION.rename) {
        if (isRemoved && !aChangeStart) {
          aChangeStart = lineA;
        }
        if ((!isRemoved || isLastLine) && aChangeStart) {
          debug(
            `${from} -${lastDiff.source.file} ${aChangeStart}-${lineA - 1}`
          );
          aChanges.push({
            end: lineA - 1,
          aChangeStart = null;
        if (!isAdded && lineA) {
          lineA++;
      if (isAdded && !bChangeStart) {
        bChangeStart = lineB;
      }
      if ((!isAdded || isLastLine) && bChangeStart) {
        debug(`${to} +${lastDiff.target.file} ${bChangeStart}-${lineB - 1}`);
        bChanges.push({
          start: bChangeStart,
          end: lineB - 1,
        });
        bChangeStart = null;
      }
      if (!isRemoved && lineB) {
        lineB++;
      }
      if (isLastLine) {
        lineA = lineB = 0;
        aChangeStart = bChangeStart = null;
      }
    }
    if (fileHeadMatch) {
          content:
            operation === GIT_OPERATION.new
              ? null
              : getRevisionFile(`${from}`, sourceFile),
          changed:
            operation === GIT_OPERATION.rename
              ? [
                  {
                    start: 0,
                    end: Infinity,
                  },
                ]
              : [],
          content:
            operation === GIT_OPERATION.delete
              ? null
              : getRevisionFile(to, targetFile),
          changed: [],

      lineB = parseInt(chunkHeadMatch[3], 10);
      if (chunkHeadMatch[5]) {
      debug(
        `${from}...${to} chunk start -${lastDiff.source.file}:${lineA} +${lastDiff.target.file}:${lineB}`
      );
export default getGitDiffs;