import getGitDiffs from '../src/getGitDiffs';

describe('getGitDiffs', () => {
    test('e42f4f6a08569afd48540759cc604aab2b8c02f3', () => {
      expect(getGitDiffs('e42f4f6a08569afd48540759cc604aab2b8c02f3')).toMatchSnapshot();
    });
    test('7037cc7c2229d424df63cdbd0981463d1801c697', () => {
      expect(getGitDiffs('7037cc7c2229d424df63cdbd0981463d1801c697')).toMatchSnapshot();
    });
    test('8d807ce9c560e3db322f90a337200ddffe4d8719', () => {
      expect(getGitDiffs('8d807ce9c560e3db322f90a337200ddffe4d8719')).toMatchSnapshot();
    });
});
