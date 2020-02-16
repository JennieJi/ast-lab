import { parse, ParserOptions } from '@babel/parser';
import { File } from '@babel/types';
import _debug from 'debug';
import extractStats from './extractStats';

const debug = _debug('es-stats:file');
const pluginsPreset = [
  'dynamicImport',
  'classProperties',
  'flowComments',
  'objectRestSpread',
  'functionBind',
  'jsx',
] as NonNullable<ParserOptions['plugins']>;
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
  let plugins = parserOptions?.plugins || [];
  if (/\.jsx?$/.test(file)) {
    plugins = plugins.concat(['flow', ...pluginsPreset]);
  } else if (/\.tsx?$/.test(file)) {
    plugins.concat(['typescript', ...pluginsPreset]);
  }
  const ast = parse(file, {
    ...(parserOptions || {}),
    sourceType: 'module',
    plugins: Array.from(new Set(plugins)),
  });
  return extractStats(ast as File);
}
