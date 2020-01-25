import { SourceLocation } from '@babel/types';

export type Module = string;
export type Member = string;
export type Members = Member[] | '*';
export type MemberRef = {
  name: Member,
  alias: Member,
};

type HasLoc = {
  loc: SourceLocation | null
};
export type Import =  MemberRef & HasLoc & {
  source: Module
};
export type Exports = {
  extends?: Module[],
  members: Array<MemberRef & HasLoc>
};
export type MemberRelation =  { [name: string]: Member[] };

export type Entry = {
  source: Module, 
  name: Member
};
export type AffectedMap = Map<Member, Entry[]>;
export type DependencyMap = Map<Module, AffectedMap>;

export type Loader = (path: string) => Promise<string | void>
