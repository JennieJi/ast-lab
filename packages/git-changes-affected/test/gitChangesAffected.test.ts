import gitChangesAffected from '../src/gitChangesAffected';

describe('gitChangesAffected', () => {
  test('can work', async () => {
    expect(await gitChangesAffected('e42f4f6a08569afd48540759cc604aab2b8c02f3', {
      parserOptions: {
        plugins: ['typescript']
      },
      paths: [
        'packages/es-stats/src'
      ]
    })).toMatchSnapshot();

    expect(await gitChangesAffected('ec7b4c814c17c4b9a9467ba0c876983a9b3cd6ec', {
      parserOptions: {
        plugins: ['typescript']
      }
    })).toMatchSnapshot();
  });
});