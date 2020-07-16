import path from 'path';
import getChangedEntries from '../src/getChangedEntries';
import gitRoot from '../src/gitRoot';
import { Entry } from 'ast-lab-types';

const sampleFile = `import a from 'SampleModule';

export const b = 1;

export function func() {
 let d = b + 1;
 return a(d);
}

export default func;
`;

const ROOT = gitRoot();
function relativeEntries(entries: Entry[]) {
  return entries.map(({ name, source }) => {
    return {
      name,
      source: path.relative(ROOT, source),
    };
  });
}

describe('getChangedEntries', () => {
  test('import could be counted as entry', () => {
    expect(
      relativeEntries(
        getChangedEntries(
          [
            {
              file: 'sampleFile.js',
              content: sampleFile,
              changed: [{ start: 1, end: 1 }],
            },
          ],
          {
            sourceType: 'module',
          }
        )
      )
    ).toMatchSnapshot();
  });
  test('single line', () => {
    expect(
      relativeEntries(
        getChangedEntries(
          [
            {
              file: 'sampleFile.js',
              content: sampleFile,
              changed: [{ start: 3, end: 3 }],
            },
          ],
          {
            sourceType: 'module',
          }
        )
      )
    ).toMatchSnapshot();
    expect(
      relativeEntries(
        getChangedEntries(
          [
            {
              file: 'sampleFile.js',
              content: sampleFile,
              changed: [{ start: 5, end: 5 }],
            },
          ],
          {
            sourceType: 'module',
          }
        )
      )
    ).toMatchSnapshot();
    expect(
      relativeEntries(
        getChangedEntries(
          [
            {
              file: 'sampleFile.js',
              content: sampleFile,
              changed: [{ start: 8, end: 8 }],
            },
          ],
          {
            sourceType: 'module',
          }
        )
      )
    ).toMatchSnapshot();
  });
  test('within 1 export', () => {
    expect(
      relativeEntries(
        getChangedEntries(
          [
            {
              file: 'sampleFile.js',
              content: sampleFile,
              changed: [{ start: 5, end: 6 }],
            },
          ],
          {
            sourceType: 'module',
          }
        )
      )
    ).toMatchSnapshot();
  });
  test('cross exports', () => {
    expect(
      relativeEntries(
        getChangedEntries(
          [
            {
              file: 'sampleFile.js',
              content: sampleFile,
              changed: [{ start: 2, end: 6 }],
            },
          ],
          {
            sourceType: 'module',
          }
        )
      )
    ).toMatchSnapshot();
  });
});
