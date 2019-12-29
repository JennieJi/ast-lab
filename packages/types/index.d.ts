import { ParserOptions } from '@babel/parser';
import { SourceLocation } from '@babel/types';

export type Module = string;
export type Member = string;
export type Members = Member[] | '*';
export type MemberRef = {
  name: Member,
  alias: Member,
};
export type Import =  MemberRef & {
  source: Module
};
export type Exports = {
  extends?: Module[],
  members: Array<MemberRef & {
    loc: SourceLocation | null
  }>
};
export type MemberRelation =  { [name: string]: Member[] };

export type Entry = {
  source: Module, 
  name: Member
};
export type AffectedMap = Map<Member, Entry[]>;
export type DependencyMap = Map<Module, AffectedMap>;

export type Loader = (path: string) => Promise<string | void>

export type Options = {
  resolver?: (base: string, target: string) => Promise<string | void>,
  loader?: Loader,
  parserOptions?: ParserOptions
}