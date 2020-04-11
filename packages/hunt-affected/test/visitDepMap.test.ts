import visitDepMap from '../src/visitDepMap';
import { DependencyMap } from '../src/types';

describe('visitDepMap()', () => {
  test('import default simple', () => {
    const c = {
      default: {
        source: '/c',
        name: 'default',
        affects: [],
      },
    };
    const b = {
      default: {
        source: '/b',
        name: 'default',
        affects: [c.default],
      },
    };
    const a = {
      default: {
        source: '/a',
        name: 'default',
        affects: [b.default],
      },
    };
    const depMap: DependencyMap = {
      '/a': a,
      '/b': b,
      '/c': c,
    };
    expect(
      visitDepMap(depMap, [{ name: 'default', source: '/a' }])
    ).toMatchSnapshot();
  });

  test('import multiples', () => {
    const depMap: DependencyMap = {
      '/a': {
        default: {
          source: '/a',
          name: 'default',
          affects: [],
        },
      },
      '/b': {
        default: {
          source: '/b',
          name: 'default',
          affects: [],
        },
      },
      '/c': {
        default: {
          source: '/c',
          name: 'default',
          affects: [],
        },
        c1: {
          source: '/c',
          name: 'c1',
          affects: [],
        },
        c2: {
          source: '/c',
          name: 'c2',
          affects: [],
        },
      },
      '/d': {
        default: {
          source: '/d',
          name: 'default',
          affects: [],
        },
      },
      '/e': {
        default: {
          source: '/e',
          name: 'default',
          affects: [],
        },
      },
    };
    depMap['/a'].default.affects.push(depMap['/b'].default);
    depMap['/b'].default.affects.push(depMap['/c'].c1);
    depMap['/b'].default.affects.push(depMap['/c'].c2);
    depMap['/c'].c1.affects.push(depMap['/d'].default);
    depMap['/c'].c1.affects.push(depMap['/e'].default);
    expect(
      visitDepMap(depMap, [
        {
          name: 'default',
          source: '/a',
        },
      ])
    ).toMatchSnapshot();
  });

  test('circular', () => {
    const depMap: DependencyMap = {
      '/a': {
        default: {
          source: '/a',
          name: 'default',
          affects: [],
        },
      },
      '/b': {
        default: {
          source: '/b',
          name: 'default',
          affects: [],
        },
      },
      '/c': {
        default: {
          source: '/c',
          name: 'default',
          affects: [],
        },
      },
    };
    depMap['/a'].default.affects.push(depMap['/b'].default);
    depMap['/b'].default.affects.push(depMap['/c'].default);
    depMap['/c'].default.affects.push(depMap['/a'].default);
    expect(
      visitDepMap(depMap, [{ name: 'default', source: '/a' }])
    ).toMatchSnapshot();
  });

  test('import all', () => {
    const depMap: DependencyMap = {
      '/a': {
        '*': {
          source: '/a',
          name: '*',
          affects: [],
        },
        default: {
          source: '/a',
          name: 'default',
          affects: [],
        },
      },
      '/b': {
        default: {
          source: '/b',
          name: 'default',
          affects: [],
        },
      },
      '/c': {
        default: {
          source: '/c',
          name: 'default',
          affects: [],
        },
      },
    };
    depMap['/a']['*'].affects.push(depMap['/b'].default);
    depMap['/b'].default.affects.push(depMap['/c'].default);
    expect(
      visitDepMap(depMap, [{ name: 'default', source: '/a' }])
    ).toMatchSnapshot();
  });
});
