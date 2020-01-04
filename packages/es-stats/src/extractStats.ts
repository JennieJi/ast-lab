
import traverse from '@babel/traverse';
import createExportVisitors from './visitors/exports';
import createImportVisitors from './visitors/imports';
import createRootRelationVisitors from './visitors/rootRelation';
import mergeVisitors from './mergeVisitors';
import { Import, Exports, MemberRelation } from 'ast-lab-types';
import { File } from '@babel/types';

export default function extractStats(ast: File) {
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