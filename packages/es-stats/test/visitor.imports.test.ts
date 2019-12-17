import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { Import } from 'ast-lab-types';
import createVisitor from '../src/visitors/imports';

const dirs = ['imports', 'exports'];
describe('import visitors', () => {
  dirs.forEach(_dir => {
    const dir = path.resolve(__dirname, '__fixtures__', _dir);
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      test(`${_dir}/${file}`, () => {
        let res = [] as Import[];
        const code = fs.readFileSync(path.resolve(dir, file), 'utf-8');
        traverse(
          // @ts-ignore
          parse(code, { 
            sourceType: 'module',
            plugins: ['dynamicImport']
          }),
          createVisitor(res)
        );
        expect(res).toMatchSnapshot();
      });
    });
  });
});
