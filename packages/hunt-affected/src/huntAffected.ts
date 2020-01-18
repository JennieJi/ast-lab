import { Options, Entry } from 'ast-lab-types';
import _debug from 'debug';
import mergeDepMap from './mergeDepMap';
import { default as visitDependencyMap, Visited as Affected } from './visitDepMap';

const debug = _debug('hunt-affected:affected');

export default async function huntAffected(sources: string[], entries: Entry[], opts: Options = {}): Promise<Affected> {
  debug('entries:', entries);
  const depMap = await mergeDepMap(sources, opts);
  debug('depMap:', depMap);
  return visitDependencyMap(depMap, entries);
}