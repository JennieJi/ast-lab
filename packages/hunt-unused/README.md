#hunt-unused

===

The CLI for detecting where your file exports are used and potentially afffected by it's changes.

Based on [hunt-affected](https://jennieji.github.io/ast-lab/modules/hunt-affected.html) with limited support.

## Quick starting

Install globally via npm:

```sh
npm i hunt-unused -g
```

And run the script under your source code path:

```sh
hunt-unused
```

### specify entries

A project usually exports a file as entry, like the package main file. This file is not used anywhere within the project. `hunt-unused` will consider `index.js` and `index.ts` as the entry files, you may configure this by your own:

```sh
hunt-unused src/index.js src/cli.js
```

## Options

### --source

All the `.js` files will be scanned under the script running path by default. You may change this by `--source=<glob>` option, e.g.:

```sh
hunt-unused --source=src/*.js
```

### --alias

Node module alias for helping solve real file paths.

Example:

```sh
hunt-unused --alias="src:./src"
```

### --module-paths

Node module paths.

Example:

```sh
hunt-unused --module-paths=node_modules,../../node_modules
```

### --extensions

File extensions to handle with. Defaults to .js, .jsx, .ts, .tsx'.

### --parser-plugins

As `hunt-unused` is using `@babel/parser` to parse JS files, you may need to take care of the parser configurations. So far it only supports passing [plugin option](https://babeljs.io/docs/en/7.4.0/babel-parser#plugins).

Following @babel/parser plugins are enabled on `.js`|`.jsx`|`.ts`|`.tsx` files by default:

- `dynamicImport`
- `classProperties`
- `flowComments`
- `objectRestSpread`
- `functionBind`
- `jsx`
- `flow` (.js and .jsx only)
- `typescript` (.ts and .tsx only)
