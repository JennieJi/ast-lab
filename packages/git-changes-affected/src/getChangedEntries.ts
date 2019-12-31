import { parse, ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';
import { createExportVisitors } from 'es-stats';
import getAbsolutePath from './getAbsolutePath';
import { Exports, Entry } from 'ast-lab-types';
import { Change } from './types';

export default function getChangedEntries(changes: Change[], parserOptions?: ParserOptions | null) {
  return changes.reduce((res, { file, content, changed }) => {
    if (!content) {
      return res;
    }
    const filePath = getAbsolutePath(file);
    const ast = parse(content, { 
      ...(parserOptions || {}),
      sourceType: 'module'
    });
    const exported = { members: [] } as Exports;
    traverse(ast, createExportVisitors(exported));
    let iExported = 0;
    const changedExports = changed.reduce(
      (res, { start: startLine, end: endLine }) => {
        while (iExported < exported.members.length) {
          const ex = exported.members[iExported];
          iExported++;
          if (!ex.loc) { continue; }
          const { start, end } = ex.loc;
          if (endLine < start.line) { 
            return res;
          } else if (startLine <= end.line) {
            res.push(ex.alias);
          }
        }
        return res;
      }, 
      [] as string[]
    );
    return res.concat(changedExports.map(name => ({
        source: filePath,
        name
      }))
    );
  }, [] as Entry[]);
}