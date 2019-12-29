import { GIT_OPERATION } from './constants';

export type Diff = {
  source: Change,
  target: Change,
  operation: GIT_OPERATION
};

export type Change = {
  file: string,
  content: string | null,
  changed: Array<{
    start: number,
    end: number
  }>
};