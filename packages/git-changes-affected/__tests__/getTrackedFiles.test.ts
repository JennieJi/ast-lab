import { getTrackedFiles } from '../src';

describe('getTrackedFiles()', () => {
  test('should get a list of files', async () => {
    const files = await getTrackedFiles('621d397900840e4aeb5cc742490431dc24a6f8a3');
    expect(files).toMatchSnapshot();
  });
});