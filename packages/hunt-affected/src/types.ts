import { ParserOptions } from '@babel/parser';
import { ResolverFactory } from 'enhanced-resolve';

export type Options = {
  /** [enhanced-resolver](https://github.com/webpack/enhanced-resolve#resolver-options) options */
  resolverOptions?: ResolverFactory.ResolverOption;
  /** Customised resolver function to resolve a module import path to absolute file path. If this options is used, `resolverOptions` will be ignored. */
  resolver?: (base: string, target: string) => Promise<string | void>;
  /** Function for reading file content from absolute file path. Uses fs.readFileSync to read with decoding *utf8* by default. */
  loader?: (path: string) => Promise<string | void>;
  /** Options provided by `@babel/parser`. Allow customize babel parser options while parsing file content to AST. */
  parserOptions?: ParserOptions;
};
