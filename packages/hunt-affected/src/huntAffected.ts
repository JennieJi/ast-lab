import { Entry } from 'ast-lab-types';
import _debug from 'debug';
import { Options } from './types';
import mergeDepMap from './mergeDepMap';
import { default as visitDependencyMap, Affected } from './visitDepMap';

const debug = _debug('hunt-affected:affected');

/**
 * Find a list of module exports affected by given module exports in given list of files.
 * Example:
 * ```
 * huntAffected(
 *  ['a.js', 'b.js', 'c.js'],
 *  [{ source: 'a.js', name: 'default' }]
 * );
 * ```
 *
 * Avaiable options:
 * - resolver: `((base: string, target: string) => Promise<string | void>) | undefined`
 * - loader: `Loader | undefined`
 * - parserOptions?: ParserOptions | undefined;
 *
 * @param sources Source file absolute paths
 * @param entries A list of entry objects with source file absolute path, and export declaration name
 * @param opts Options
 * @return A promise resolves to a key, value pair, key is an absolute path of a module, value is a *Set* of declaration names
 */
export default async function huntAffected(
  sources: string[],
  entries: Entry[],
  opts: Options = {}
): Promise<Affected> {
  debug('entries:', entries);
  const depMap = await mergeDepMap(sources, opts);
  debug('depMap:', depMap);
  return visitDependencyMap(depMap, entries);
}
