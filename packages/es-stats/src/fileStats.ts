import { parse, ParserOptions } from '@babel/parser';
import { File } from '@babel/types';
import _debug from 'debug';
import extractStats from './extractStats';

const debug = _debug('es-stats:file');
/**
 * Get ES file imports, exports, and root declaration definitions.
 * Example:
 * ```
 * fileStats(
 *  fs.readFileSync('esfile.js', 'utf-8'),
 *  {
 *    plugins: ['jsx']
 *  }
 * );
 * ```
 *
 * @param file File content
 * @param parserOptions Options supported by @babel/parser@^7.7.5
 */
export default function fileStats(
  file: string,
  parserOptions?: ParserOptions
): ReturnType<typeof extractStats> {
  debug(file);
  const ast = parse(file, {
    ...(parserOptions || {}),
    sourceType: 'module',
  });
  return extractStats(ast as File);
}
