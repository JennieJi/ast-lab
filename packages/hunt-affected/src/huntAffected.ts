import { Options, Entry } from 'ast-lab-types';
import mergeDepMap from './mergeDepMap';
import { default as visitDependencyMap, Visited as Affected } from './visitDepMap';

export default async function huntAffected(sources: string[], entries: Entry[], opts: Options = {}): Promise<Affected> {
  const depMap = await mergeDepMap(sources, opts);
  return visitDependencyMap(depMap, entries);
}