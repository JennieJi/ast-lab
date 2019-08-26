import { getTrackedFiles } from '../src';

describe('getTrackedFiles()', () => {
  test('should get a list of files', () => {
    const files = getTrackedFiles();
    expect(Array.isArray(files)).toBeTruthy();
    expect(files.filter(f => !!f && typeof f === 'string').length).toBeGreaterThan(0)
  });
});