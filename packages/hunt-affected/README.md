hunt-affected
===

Detect where your file exports are used and potentially afffected by it's changes.

## Quick start

Intalling via npm:
```sh
npm i hunt-affected
```

And feed the function with a list of absolute file paths you would like to check, and the entry points like this:
```javascript
const huntAffected = require('hunt-affected');

huntAffected(
  ['a.js', 'b.js', 'c.js'],
  [{ source: 'a.js', name: 'default' }]
);
```

To support things like `JSX`, `flow`, `dynamic imports`, etc.. You will need to enable `@babel/parser` plugins:
```javascript
huntAffected(
  ['a.js', 'b.js', 'c.js'],
  [{ source: 'a.js', name: 'default' }]
  {
    parserOptions: {
      plugins: ['jsx', 'dynamicImport']
    }
  }
);
```

All the options in `parserOptions` will be passed to `@babel/parser` directly. `@babel/parser` options can be found [here](https://babeljs.io/docs/en/babel-parser).

By default, it will try to read file with NodeJs default file system and decode them with `utf-8`.

You may replace this behavior by passing a customised `loader` function:
```javascript
huntAffected(
  ['a.js', 'b.js', 'c.js'],
  [{ source: 'a.js', name: 'default' }]
  {
    loader: async (path) {
      return await myWayToReadFile(path);
    }
  }
);
```

And when it tries to resolve file imported module paths to absolute file path, it will use Webpack's [enhanced-resolve](http://github.com/webpack/enhanced-resolve) by default, and tries to resolve to real files.

You may replace this behavior by passing a customised `resolver` function:
```javascript
huntAffected(
  ['a.js', 'b.js', 'c.js'],
  [{ source: 'a.js', name: 'default' }]
  {
    resolver: async (base: string, target: string) => {
      return 'resolved/file/path.js';
    }
  }
);
```