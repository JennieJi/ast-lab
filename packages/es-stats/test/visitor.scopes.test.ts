import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { MemberRelation } from 'ast-lab-types';
import createVisitor from '../src/visitors/rootRelation';

const dir = path.resolve(__dirname, '__fixtures__/scopes');
const files = fs.readdirSync(dir);
describe('import visitors', () => {
  files.forEach(file => {
    test(file, () => {
      console.log('===', file);
      let res = {} as MemberRelation;
      const code = fs.readFileSync(path.resolve(dir, file), 'utf-8');
      traverse(
        // @ts-ignore
        parse(code, { 
          sourceType: 'module',
          plugins: [
            'classProperties'
          ]
        }),
        createVisitor(res)
      );
      expect(res).toMatchSnapshot();
    });
  });
});
