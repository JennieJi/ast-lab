es-stats
===

Find out import, exports and root declarations' dependency relationships of an ES module file.

## Quick start

Intalling via npm:
```sh
npm i es-stats
```

Extract imports, exports, and root declarations' relationship with default settings:
```javascript
const esStats = require('es-stats');
const fs = require('fs');

const {
  imports,
  exports,
  relations
} = esStats(fs.readFileSync('myfile.js', 'utf-8'));
console.log('Imports:', imports);
console.log('Exports:', exports);
console.log('Relations:', relations);
```

To support things like `JSX`, `flow`, `dynamic imports`, etc.. You will need to enable `@babel/parser` plugins:
```javascript
const {
  imports,
  exports,
  relations
} = esStats(
  fs.readFileSync('myfile.js', 'utf-8'),
  {
    plugins: ['jsx', 'dynamicImport']
  }
);
```

All the options in the 2nd parameter will be passed to `@babel/parser` directly. `@babel/parser` options can be found [here](https://babeljs.io/docs/en/babel-parser).