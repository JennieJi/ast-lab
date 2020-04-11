import { SourceLocation } from '@babel/types';

export type Module = string;
export type Member = string;
export type Members = Member[] | '*';
export type MemberRef = {
  name: Member;
  alias: Member;
};

type HasLoc = {
  loc: SourceLocation | null;
};
export type ImportBase = MemberRef & {
  source: Module;
};
export type Import = ImportBase & HasLoc;
export type Exports = {
  extends?: Module[];
  members: Array<MemberRef & HasLoc>;
};
export type MemberRelation = { [name: string]: (Member | ImportBase)[] };

export type Entry = {
  source: Module;
  name: Member;
};
