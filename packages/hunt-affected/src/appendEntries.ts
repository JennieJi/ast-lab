import { DependencyMap, Module, Entry, AffectedMap, Member } from "ast-lab-types";

export default function appendEntries(depMap: DependencyMap, mod: Module, member: Member, entry: Entry[]): void {
  const affected  = depMap.get(mod) || new Map() as AffectedMap;
  if (!depMap.has(mod)) {
    depMap.set(mod, affected);
  }
  affected.set(member, affected.get(member) ? (affected.get(member) as Entry[]).concat(entry) : entry);
}