import { ParserOptions } from '@babel/parser';

export type Options = {
  /** Customised resolver function to resolve a module import path to absolute file path. */
  resolver?: (base: string, target: string) => Promise<string | void>;
  /** Function for reading file content from absolute file path. Uses fs.readFileSync to read with decoding *utf8* by default. */
  loader?: (path: string) => Promise<string | void>;
  /** Options provided by `@babel/parser`. Allow customize babel parser options while parsing file content to AST. */
  parserOptions?: ParserOptions;
};
