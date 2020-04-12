import visitDepMap from '../src/visitDepMap';
import { getDeclaration } from '../src/mergeDepMap';
import { DependencyMap } from '../src/types';

const genDepMap = (
  files: Array<{
    path: string;
    declarations: Array<{
      name: string;
      affects: Array<{ path: string; name: string }>;
    }>;
  }>
) => {
  const depMap = {} as DependencyMap;
  files.forEach(({ path, declarations }) => {
    declarations.forEach(({ name, affects }) => {
      const d = getDeclaration(depMap, path, name, 1);
      affects.forEach(({ path, name }) => {
        d.affects.push(getDeclaration(depMap, path, name, 1));
      });
    });
  });
  return depMap;
};

describe('visitDepMap()', () => {
  test('import default simple', () => {
    expect(
      visitDepMap(
        genDepMap([
          {
            path: '/a',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/b', name: 'a' }],
              },
            ],
          },
          {
            path: '/b',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/c', name: 'b' }],
              },
              {
                name: 'a',
                affects: [{ path: '/b', name: 'default' }],
              },
            ],
          },
          {
            path: '/c',
            declarations: [
              {
                name: 'default',
                affects: [],
              },
              {
                name: 'b',
                affects: [{ path: '/c', name: 'default' }],
              },
            ],
          },
        ]),
        [{ name: 'default', source: '/a' }]
      )
    ).toMatchSnapshot();
  });

  test('import multiples', () => {
    expect(
      visitDepMap(
        genDepMap([
          {
            path: '/a',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/b', name: 'a' }],
              },
            ],
          },
          {
            path: '/b',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/c', name: 'b' }],
              },
              {
                name: 'a',
                affects: [{ path: '/b', name: 'default' }],
              },
            ],
          },
          {
            path: '/c',
            declarations: [
              {
                name: 'c1',
                affects: [
                  { path: '/d', name: 'c1' },
                  { path: '/e', name: 'c1' },
                ],
              },
              {
                name: 'b',
                affects: [
                  { path: '/c', name: 'c1' },
                  { path: '/c', name: 'c2' },
                ],
              },
            ],
          },
          {
            path: '/d',
            declarations: [
              {
                name: 'default',
                affects: [],
              },
              {
                name: 'c1',
                affects: [{ path: '/d', name: 'default' }],
              },
            ],
          },
          {
            path: '/e',
            declarations: [
              {
                name: 'default',
                affects: [],
              },
              {
                name: 'c1',
                affects: [{ path: '/e', name: 'default' }],
              },
            ],
          },
        ]),
        [
          {
            name: 'default',
            source: '/a',
          },
        ]
      )
    ).toMatchSnapshot();
  });

  test('circular', () => {
    expect(
      visitDepMap(
        genDepMap([
          {
            path: '/a',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/c', name: 'a' }],
              },
              {
                name: 'b',
                affects: [{ path: '/a', name: 'default' }],
              },
            ],
          },
          {
            path: '/b',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/a', name: 'b' }],
              },
              {
                name: 'c',
                affects: [{ path: '/b', name: 'default' }],
              },
            ],
          },
          {
            path: '/c',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/b', name: 'c' }],
              },
              {
                name: 'a',
                affects: [{ path: '/c', name: 'default' }],
              },
            ],
          },
        ]),
        [{ name: 'default', source: '/a' }]
      )
    ).toMatchSnapshot();
  });

  test('import all', () => {
    expect(
      visitDepMap(
        genDepMap([
          {
            path: '/a',
            declarations: [
              {
                name: '*',
                affects: [{ path: '/b', name: 'a' }],
              },
              {
                name: 'a',
                affects: [],
              },
            ],
          },
          {
            path: '/b',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/c', name: 'b' }],
              },
              {
                name: 'a',
                affects: [{ path: '/b', name: 'default' }],
              },
            ],
          },
          {
            path: '/c',
            declarations: [
              {
                name: 'default',
                affects: [],
              },
              {
                name: 'b',
                affects: [{ path: '/c', name: 'default' }],
              },
            ],
          },
        ]),
        [{ name: 'default', source: '/a' }]
      )
    ).toMatchSnapshot();
  });

  test('export from', () => {
    expect(
      visitDepMap(
        genDepMap([
          {
            path: '/a',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/index', name: 'a' }],
              },
            ],
          },
          {
            path: '/b',
            declarations: [
              {
                name: 'default',
                affects: [{ path: '/index', name: 'b' }],
              },
            ],
          },
          {
            path: '/index',
            declarations: [
              {
                name: 'a',
                affects: [],
              },
              {
                name: 'b',
                affects: [],
              },
            ],
          },
        ]),
        [{ name: 'default', source: '/a' }]
      )
    ).toMatchSnapshot();
  });
});
