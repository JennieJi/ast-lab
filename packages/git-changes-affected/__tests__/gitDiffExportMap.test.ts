import getDiffExportMap from '../src';

describe('getDiffExportMap', () => {
  it('can work', () => {
    expect(
      getDiffExportMap(
        '621d397900840e4aeb5cc742490431dc24a6f8a3',
        {
          transform() {
            return '';
          }
        }
      )
    ).toMatchSnapshot();
  });
});

