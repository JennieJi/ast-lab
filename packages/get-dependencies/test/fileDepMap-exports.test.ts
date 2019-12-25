import fs from 'fs';
import path from 'path';
import fileDepMap from '../src/fileDepMap';

const dir = path.resolve(__dirname, '__fixtures__/exports');
describe('fileDepMap()', () => {
  fs.readdirSync(dir).forEach(file => {
    test(file, async () => {
      const res = await fileDepMap(path.resolve(dir, file), {
        parserOptions: {
          plugins: ['dynamicImport']
        }
      });
      expect(res).toMatchSnapshot();
    });
  });
});
