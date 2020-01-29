import traverse from '@babel/traverse';
import createExportVisitors from './visitors/exports';
import createImportVisitors from './visitors/imports';
import createRootRelationVisitors from './visitors/rootRelation';
import mergeVisitors from './mergeVisitors';
import { Import, Exports, MemberRelation } from 'ast-lab-types';
import { File } from '@babel/types';

/**
 * Extract imports, exports, and root declarations relations from an AST
 *  * Example:
 * ```
 * const fs = require('fs');
 * const { parse } = require('@babel/parse');
 *
 * extractStats(
 *  parse(
 *    fs.readFileSync('esfile.js', 'utf-8'),
 *    {
 *      sourceType: 'module'
 *      plugins: ['jsx']
 *    }
 *  )
 * );
 * ```
 *
 * @param ast File AST object
 */
export default function extractStats(
  ast: File
): {
  imports: Import[];
  exports: Exports;
  relations: MemberRelation;
} {
  const imports = [] as Import[];
  const exports = { members: [] } as Exports;
  const relations = {} as MemberRelation;
  traverse(
    // @ts-ignore
    ast,
    mergeVisitors(
      createExportVisitors(exports),
      createImportVisitors(imports),
      createRootRelationVisitors(relations)
    )
  );

  return {
    imports,
    exports,
    relations,
  };
}
