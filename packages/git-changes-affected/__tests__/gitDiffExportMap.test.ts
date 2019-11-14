import getDiffExportMap from '../src';

describe('getDiffExportMap', () => {
  it('can work', async () => {
    const res = await getDiffExportMap(
      '621d397900840e4aeb5cc742490431dc24a6f8a3',
      {
        transform() {
          return '';
        },
      }
    );
    expect(res).toMatchSnapshot();
  });
});

