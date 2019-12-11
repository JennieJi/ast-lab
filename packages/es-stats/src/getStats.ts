import { parse } from '@babel/parser';
import traverse, { Visitor } from '@babel/traverse';
import createExportVisitors from './visitors/exports';
import createImportVisitors from './visitors/imports';
import createRootRelationVisitors from './visitors/rootRelation';
import { Import, Exports, MemberRelation } from 'ast-lab-types';



/**
 * Get ES6 file dependencies (module and imported defination)
 * @todo support import affected export mapping
 * @param file {string} file content in text
 * @return {Map<string, Set<name> | null>}
 */
export default function getStats(file: string) {
  const ast = parse(file, { sourceType: 'module' });
  const imports = [] as Import[];
  const exports = { members: [] } as Exports;
  const relations = {} as MemberRelation;
  traverse(ast, {
    ...createExportVisitors(exports),
    ...createImportVisitors(imports),
    ...createRootRelationVisitors(relations),
  } as Visitor);


  return {
    imports,
    exports,
    relations,
  };
}