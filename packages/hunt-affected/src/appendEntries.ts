import {
  DependencyMap,
  Module,
  Entry,
  AffectedMap,
  Member,
} from 'ast-lab-types';

/**
 * @internal
 * @param depMap
 * @param mod
 * @param member
 * @param entries
 */
export default function appendEntries(
  depMap: DependencyMap,
  mod: Module,
  member: Member,
  entries: Entry[]
): void {
  let affected = depMap.get(mod);
  if (!affected) {
    affected = new Map() as AffectedMap;
    depMap.set(mod, affected);
  }
  affected.set(
    member,
    affected.get(member)
      ? (affected.get(member) as Entry[]).concat(entries)
      : entries
  );
}
