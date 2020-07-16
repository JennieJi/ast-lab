import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import debug from 'debug';
import { Declarations } from 'ast-lab-types';
import createVisitor from '../src/visitors/rootRelation';

const dirs = ['jsx'];
describe('rootRelation visitors', () => {
  dirs.forEach(dir => {
    const dirPath = path.resolve(__dirname, '__fixtures__', dir);
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      test(`${dir}/${file}`, () => {
        debug('es-stats:test')(`${dir}/${file}`);
        let res = {} as Declarations;
        const code = fs.readFileSync(path.resolve(dirPath, file), 'utf-8');
        traverse(
          // @ts-ignore
          parse(code, {
            sourceType: 'module',
            plugins: ['classProperties', 'jsx'],
          }),
          createVisitor(res)
        );
        expect(res).toMatchSnapshot();
      });
    });
  });
});
