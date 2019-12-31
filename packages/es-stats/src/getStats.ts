import { parse, ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';
import createExportVisitors from './visitors/exports';
import createImportVisitors from './visitors/imports';
import createRootRelationVisitors from './visitors/rootRelation';
import mergeVisitors from './mergeVisitors';
import { Import, Exports, MemberRelation } from 'ast-lab-types';



/**
 * Get ES6 file dependencies (module and imported defination)
 * @todo support import affected export mapping
 * @param file {string} file content in text
 * @return {Map<string, Set<name> | null>}
 */
export default function getStats(file: string, parserOptions?: ParserOptions) {
  const ast = parse(file, { 
    ...(parserOptions || {}),
    sourceType: 'module'
  });
  const imports = [] as Import[];
  const exports = { members: [] } as Exports;
  const relations = {} as MemberRelation;
  // @ts-ignore
  traverse(ast, mergeVisitors(
    createExportVisitors(exports),
    createImportVisitors(imports),
    createRootRelationVisitors(relations)
  ));

  return {
    imports,
    exports,
    relations,
  };
}