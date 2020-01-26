import exec from './exec';

/** @internal */
export default function gitRoot() {
  return exec('git rev-parse --show-toplevel');
}