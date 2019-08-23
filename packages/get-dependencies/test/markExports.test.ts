// @ts-ignore
import { enumerateArgsTestFunction, configArgs } from 'lazy-jest';
import markExports from '../src/markExports';

describe('markExports()', () => {
  enumerateArgsTestFunction(
    markExports,
    configArgs()
      .arg('marked', [new Map()])
      .arg('source', ['a'])
      .arg('markExports', [
        null,
      ]),
    'no exports should not mark'
  );
  enumerateArgsTestFunction(
    markExports,
    configArgs()
      .arg('marked', [new Map()])
      .arg('source', ['a'])
      .arg('markExports', [
        true,
        null,
        new Set(['a1', 'a2', 'a3'])
      ]),
    'all exports should not be overwritten'
  );
  enumerateArgsTestFunction(
    markExports,
    configArgs()
      .arg('marked', [new Map()])
      .arg('source', ['a'])
      .arg('markExports', [
        new Set(['a1', 'a3']),
        new Set(['a2', 'a3']),
      ]),
    'exports should append and dedupe'
  );
  enumerateArgsTestFunction(
    markExports,
    configArgs()
      .arg('marked', [new Map()])
      .arg('source', ['a'])
      .arg('markExports', [
        null,
        new Set(['a1',]),
        new Set(['a2', 'a3']),
      ]),
    'no exports should be overwritten by limited exports'
  );
  enumerateArgsTestFunction(
    markExports,
    configArgs()
      .arg('marked', [new Map()])
      .arg('source', ['a'])
      .arg('markExports', [
        new Set(['a1', 'a2', 'a3']),
        true
      ]),
    'limited exports should be overwritten by all exports'
  );
});
