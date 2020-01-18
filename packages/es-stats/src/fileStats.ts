import { parse, ParserOptions } from '@babel/parser';
import { File } from '@babel/types';
import _debug from 'debug';
import extractStats from './extractStats';

const debug = _debug('es-stats:file');
/**
 * Get ES6 file dependencies (module and imported defination)
 * @todo support import affected export mapping
 * @param file {string} file content in text
 * @return {Map<string, Set<name> | null>}
 */
export default function fileStats(file: string, parserOptions?: ParserOptions) {
  debug(file);
  const ast = parse(file, { 
    ...(parserOptions || {}),
    sourceType: 'module'
  });
  return extractStats(ast as File);
}