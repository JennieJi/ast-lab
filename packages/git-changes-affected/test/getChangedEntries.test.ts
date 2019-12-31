import getChangedEntries from '../src/getChangedEntries';

const sampleFile = 
`import a from 'SampleModule';

export const b = 1;

export default function func() {
 let d = b + 1;
 return a(d);
}`;

describe('getChangedEntries', () => {
  test('import should not be counted as entry', () => {
      expect(getChangedEntries(
        [{
          file: 'sampleFile.js',
          content: sampleFile,
          changed: [
            { start: 1, end: 1 }
          ]
        }], 
        {
          sourceType: 'module'
        }
      )).toMatchSnapshot();
  });
  test('single line', () => {
    expect(getChangedEntries(
      [{
        file: 'sampleFile.js',
        content: sampleFile,
        changed: [
          { start: 3, end: 3 }
        ]
      }], 
      {
        sourceType: 'module'
      }
    )).toMatchSnapshot();
    expect(getChangedEntries(
      [{
        file: 'sampleFile.js',
        content: sampleFile,
        changed: [
          { start: 5, end: 5 }
        ]
      }], 
      {
        sourceType: 'module'
      }
    )).toMatchSnapshot();
    expect(getChangedEntries(
      [{
        file: 'sampleFile.js',
        content: sampleFile,
        changed: [
          { start: 8, end: 8 }
        ]
      }], 
      {
        sourceType: 'module'
      }
    )).toMatchSnapshot();
  })
  test('within 1 export', () => {
      expect(getChangedEntries(
        [{
          file: 'sampleFile.js',
          content: sampleFile,
          changed: [
            { start: 5, end: 6 }
          ]
        }], 
        {
          sourceType: 'module'
        }
      )).toMatchSnapshot();
  });
  test('cross exports', () => {
      expect(getChangedEntries(
        [{
          file: 'sampleFile.js',
          content: sampleFile,
          changed: [
            { start: 2, end: 6 }
          ]
        }], 
        {
          sourceType: 'module'
        }
      )).toMatchSnapshot();
  });
});
