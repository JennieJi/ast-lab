import path from 'path';
import fileDepMap from '../src/fileDepMap';
import { relativeDepMap } from './util';

describe('debug mono repo', () => {
  test('fileDepMap', async () => {
    const res = await fileDepMap(path.resolve(__dirname, '../src/index.ts'), {
      parserOptions: {
        plugins: ['typescript'],
      },
    });
    expect(relativeDepMap(res)).toMatchSnapshot();
  });
});
