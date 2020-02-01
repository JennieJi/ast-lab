# `hunt-affected-cli`

===

The CLI for detecting where your file exports are used and potentially afffected by it's changes.

Based on [hunt-affected](https://jennieji.github.io/ast-lab/modules/hunt-affected.html) with limited support.

## Quick starting

Install globally via npm:

```sh
npm i hunt-affected -g
```

And run the script under your source code path:

```sh
hunt-affected <entryFile> [*|[export1[,export2[,exports]]]]
```

## Options

### --source

All the `.js` files will be scanned under the script running path by default. You may change this by `--source=<glob>` option, e.g.:

```sh
hunt-affected myFile.js default --source=src/*.js
```

### --parser-plugins

As `hunt-affected` is using `@babel/parser` to parse JS files, you may need to take care of the parser configurations. So far it only supports passing [plugin option](https://babeljs.io/docs/en/7.4.0/babel-parser#plugins).

If you would like to handle Typescript files:

```sh
hunt-affected myFile.js --parser-plugins=typescript
```

If you would like to handle Flow files:

```sh
hunt-affected myFile.js --parser-plugins=flow
```

If you would like to handle JSX:

```sh
hunt-affected myFile.js --parser-plugins=typescript,jsx
```
