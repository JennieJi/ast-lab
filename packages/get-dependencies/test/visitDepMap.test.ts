import visitDepMap from '../src/visitDepMap';

describe('visitDepMap()', () => {
  test('import default simple', () => {
    expect(visitDepMap(
      new Map([
        ['/a', new Map([
          [
            'default',
            [{ source: '/b', name: 'default' }]
          ]
        ])], 
        ['/b', new Map([
          [
            'default',
            [{ source: '/c', name: 'default' }]
          ]
        ])], 
        ['/c', new Map([
          [
            'default', 
            []
          ]
        ])]
      ]), 
      [{ name: 'default', source: '/a' }]
    )).toMatchSnapshot();
  });

  test('import multiples', () => {
    expect(visitDepMap(
      new Map([
        ['/a', new Map([
          [
            'default',
            [{ source: '/b', name: 'default' }]
          ]
        ])], 
        ['/b', new Map([
          [
            'default',
            [
              { source: '/c', name: 'c1' }, 
              { source: '/c', name: 'c2' }
            ]
          ]
        ])], 
        ['/c', new Map([
          [
            'default',
            []
          ], 
          [
            'c1',
            [{ source: '/d', name: 'default' }]
          ], 
          [
            'c2',
            [{ source: '/e', name: 'default' }]
          ]
        ])]
      ]), 
      [{
        name: 'default',
        source: '/a'
      }]
    )).toMatchSnapshot();
  });
  
  test('circular', () => {
    expect(visitDepMap(
      new Map([
        [
          '/a',
          new Map([
            [
              'default',
              [{ source: '/b', name: 'default' }]
            ]
          ])
        ], [
          '/b',
          new Map([
            [
              'default',
              [{ source: '/c', name: 'default' }]
            ]
          ])
        ], [
          '/c',
          new Map([
            [
              'default',
              [{ source: '/a', name: 'default' }]
            ]
          ])
        ]
      ]), 
      [{ name: 'default', source: '/a' }]
    )).toMatchSnapshot();
  });
});