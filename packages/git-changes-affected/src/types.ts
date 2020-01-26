import { GIT_OPERATION } from './constants';

export type Diff = {
  source: Change,
  target: Change,
  operation: GIT_OPERATION
};

export type Change = {
  /** File path relative to the repo */
  file: string,
  content: string | null,
  /** Changed file code line ranges */
  changed: Array<{
    start: number,
    end: number
  }>
};