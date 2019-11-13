// @ts-ignore
import { filterDependents } from './utils';

describe('filterDependents()', () => {
  test('filter extensions', async () => {
    const ret = await filterDependents(
      'imports', 
      ['importCss.js'], 
      { './importCss.js': ['default'] },
      {
        extensions: ['.js']
      }
    )
    expect(ret).toMatchSnapshot();
  });
});
