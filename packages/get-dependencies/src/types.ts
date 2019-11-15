import { ALL_EXPORTS } from './constants';
import resolveModulePath from './resolveModulePath';

export type Module = string;
type Imported = string;
type ImportedAlias = string;
export type Exported = string;

export type ModuleExported = Set<Exported> | null | typeof ALL_EXPORTS;
export type ModuleImported = Map<Imported, {
  alias: ImportedAlias | null,
  affectedExports: ModuleExported
}>;

export type Dependents = Map<Module, ModuleImported>;
export type Exports = Map<Module, ModuleExported>;

export type ModuleDirectory = string[];

export type Alias = {
  [key: string]: string
};

export type Loader = (filename: string) => Promise<string>;

export type PathNode = {
  source: Module | null,
  importModule: Module,
  i2e: ModuleImported | null,
  prev: PathNode | null
};

export type Options = {
  loader?: Loader,
  moduleDirectory?: ModuleDirectory,
  extensions: string[],
  alias?: Alias,
  resolver: typeof resolveModulePath
};

export type VisitedNode = PathNode[];
export type Visited = Map<Module, VisitedNode>;
