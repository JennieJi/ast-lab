import visitDepMap from '../src/visitDepMap';

describe('visitDepMap()', () => {
  const depMap = new Map([
    [
      "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importAll.js",
      new Map([["b", []]])
    ], 
    [
    "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importDefault.js",
    new Map([
      [
        "*", 
        [{
          "name": "a",
          "source": "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importAll.js",
        }, {
          "name": "func",
          "source": "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importAll.js",
        }],
      ],
    ]),
  ],
  [
    "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importNamed.js",
    new Map([
      [
        "resolveFactory", 
        [{
          "name": "c",
          "source": "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importAlias.js",
        },
        {
          "name": "func",
          "source": "/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importAlias.js",
        }],
      ]
    ])
  ]
  ]);
  test('importNamed.resolveFactory', () => {
    expect(visitDepMap(depMap, [
      {
        name: 'resolveFactory',
        source: '/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importNamed.js'
      }
    ])).toMatchSnapshot();
  });
  test('importDefault.*', () => {
    expect(visitDepMap(depMap, [
      {
        name: '*',
        source: '/Users/jennie.ji/Projects/affected/packages/get-dependencies/test/__fixtures__/imports/importDefault.js'
      }
    ])).toMatchSnapshot();
  });
  
  // test('circular', () => {
  //   expect(visitDepMap(
  //     new Map([
  //       [
  //         '/a',
  //         new Map([
  //           [
  //             'default',
  //             [{
  //               source: '/b',
  //               name: 'default'
  //             }]
  //           ]
  //         ])
  //       ], [
  //         '/b',
  //         new Map([
  //           [
  //             'default',
  //             [{
  //               source: '/c',
  //               name: 'default'
  //             }]
  //           ]
  //         ])
  //       ], [
  //         '/c',
  //         new Map([
  //           [
  //             'default',
  //             [{
  //               source: '/a',
  //               name: 'default'
  //             }]
  //           ]
  //         ])
  //       ]
  //     ]), 
  //     [{
  //       name: 'default',
  //       source: '/a'
  //     }]
  //   )).toMatchSnapshot();
  // });
});