import exec from './exec';

export default function gitRoot() {
  return exec('git rev-parse --show-toplevel');
}