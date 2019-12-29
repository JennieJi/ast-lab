import getGitDiffs from '../src/getGitDiffs';

describe('getGitDiffs', () => {
    test('e42f4f6a08569afd48540759cc604aab2b8c02f3', () => {
      expect(getGitDiffs('e42f4f6a08569afd48540759cc604aab2b8c02f3')).toMatchSnapshot();
    });
    test('7037cc7c2229d424df63cdbd0981463d1801c697', () => {
      expect(getGitDiffs('7037cc7c2229d424df63cdbd0981463d1801c697')).toMatchSnapshot();
    });
});
