import { Options, Entry } from 'ast-lab-types';
import mergeDepMap from './mergeDepMap';
import visitDependencyMap from './visitDepMap';

export default async function huntAffected(sources: string[], entries: Entry[], opts: Options = {}) {
  const depMap = await mergeDepMap(sources, opts);
  return visitDependencyMap(depMap, entries);
}