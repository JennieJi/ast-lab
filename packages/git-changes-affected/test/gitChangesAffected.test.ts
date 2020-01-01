import path from 'path';
import gitRoot from '../src/gitRoot';
import gitChangesAffected from '../src/gitChangesAffected';
import { Affected } from 'hunt-affected';


const ROOT = gitRoot();
function relativeEntries(affected: Affected) {
  const updated = {} as Affected;
  Object.keys(affected).forEach(p => {
    updated[path.relative(ROOT, p)] = affected[p];
  });
  return updated;
}

describe('gitChangesAffected', () => {
  test('can work', async () => {
    const case1 = await gitChangesAffected('e42f4f6a08569afd48540759cc604aab2b8c02f3', {
      parserOptions: {
        plugins: ['typescript']
      },
      paths: [
        'packages/es-stats/src'
      ]
    });
    expect(relativeEntries(case1)).toMatchSnapshot();

    const case2 = await gitChangesAffected('ec7b4c814c17c4b9a9467ba0c876983a9b3cd6ec', {
      parserOptions: {
        plugins: ['typescript']
      }
    });
    expect(relativeEntries(case2)).toMatchSnapshot();
  });
});