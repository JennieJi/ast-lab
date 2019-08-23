import getGitDiffs from '../src/getGitDiffs';

describe('git-changes-affected', () => {
    it('can work', async () => {
        expect(await getGitDiffs('621d397900840e4aeb5cc742490431dc24a6f8a3')).toMatchSnapshot();
    });
});
