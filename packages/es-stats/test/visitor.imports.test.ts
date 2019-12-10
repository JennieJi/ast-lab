import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { Import } from 'ast-lab-types';
import createVisitor from '../src/visitors/imports';

const dir = path.resolve(__dirname, '__fixtures__/imports');
const files = fs.readdirSync(dir);
describe('import visitors', () => {
  files.forEach(file => {
    test(file, () => {
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
