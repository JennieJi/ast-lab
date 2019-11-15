import path from 'path';
import { createResolver, getTrackedFiles } from '../src';

describe('createResolver()', () => {
  test('can work', async () => {
    expect(await createResolver(
      getTrackedFiles('953d1596ff7df0016edb56d54195b445929c7c6e'),
      ['.js', '.ts']
    )(
      '../test/filterDependents.test',
      path.resolve(__dirname, '../../get-dependencies/src/index')
    )).toMatchSnapshot();
  });
});