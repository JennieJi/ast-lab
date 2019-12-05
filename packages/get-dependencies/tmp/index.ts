import { default as filterDependents } from './filterDependents';

export { default as getExports } from './es6Detect/getExports';
export { default as hasExt } from './hasExt';
export { default as createResolver } from './createResolver';

export * from './types';
export { filterDependents };
export default filterDependents;