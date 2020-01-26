git-changes-affected
===

Find git changes affected files

## Quick start

Intalling via npm:
```sh
npm i git-changes-affected
```

Fnd what modules your last commit change affects by:
```javascript
const gitChangesAffected = require('git-changes-affected');
gitChangesAffected();
```

Find impact of changes by certain commit:
```javascript
gitChangesAffected({
  to: '59037780a46c5000830a7a6705ebfa82d5a30095'
});
```

Find impact of changes between 2 revisions:
```javascript
gitChangesAffected({
  to: '59037780a46c5000830a7a6705ebfa82d5a30095',
  from: '8e0d337483f9c9db07deeb2d82d7a8b3f8515423'
});
```

If your repo uses special supports like JSX, flow, typescript, etc., you will need to enable `@babel/parser` plugins as following:
```javascript
gitChangesAffected({
  parserOptions: {
    plugins: ['jsx', 'typescript']
  }
});
```