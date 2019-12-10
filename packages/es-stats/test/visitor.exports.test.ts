import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { Exports } from 'ast-lab-types';
import createVisitor from '../src/visitors/exports';

const dir = path.resolve(__dirname, '__fixtures__/exports');
const files = fs.readdirSync(dir);
describe('export visitors', () => {
  files.forEach(file => {
    test(file, () => {
      let res = { members: [] } as Exports;
      const code = fs.readFileSync(path.resolve(dir, file), 'utf-8');
      traverse(
        // @ts-ignore
        parse(code, { sourceType: 'module' }),
        createVisitor(res)
      );
      expect(res).toMatchSnapshot();
    });
  });
});
