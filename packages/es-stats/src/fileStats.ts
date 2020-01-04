import { parse, ParserOptions } from '@babel/parser';
import { File } from '@babel/types';
import extractStats from './extractStats';

/**
 * Get ES6 file dependencies (module and imported defination)
 * @todo support import affected export mapping
 * @param file {string} file content in text
 * @return {Map<string, Set<name> | null>}
 */
export default function fileStats(file: string, parserOptions?: ParserOptions) {
  const ast = parse(file, { 
    ...(parserOptions || {}),
    sourceType: 'module'
  });
  return extractStats(ast as File);
}