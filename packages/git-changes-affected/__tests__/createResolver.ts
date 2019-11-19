import path from 'path';
import { createResolver, getTrackedFiles } from '../src';

describe('createResolver()', () => {
  const resolver = createResolver(
    getTrackedFiles('953d1596ff7df0016edb56d54195b445929c7c6e'),
    ['.js', '.ts']
  );
  test('relative path', async () => {
    expect(await resolver(
      '../test/filterDependents.test',
      path.resolve(__dirname, '../../get-dependencies/src/index.ts')
    )).toMatchSnapshot();
    expect(await resolver(
      './jest.config',
      path.resolve(__dirname, '../../get-dependencies/jest.config.js')
    )).toMatchSnapshot();
  });
});