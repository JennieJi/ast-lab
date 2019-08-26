import getGitDiffs from '../src/getGitDiffs';

describe('git-changes-affected', () => {
    test('can work', () => {
        expect(getGitDiffs('621d397900840e4aeb5cc742490431dc24a6f8a3')).toMatchSnapshot();
    });
});
