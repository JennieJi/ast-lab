import huntUnused from '../src';

describe('huntUnused', () => {
  test('fixture test', async () => {
    expect(
      await huntUnused(['test/fixtures/index.js'], {
        source: 'test/fixtures/*.js',
      })
    ).toMatchSnapshot();
  });
});
