import { execa } from 'execa';

export async function getBranchName() {
    const { stdout: branchName } = await execa('git', ['branch', '--show-current'], { stdio: 'pipe' });
    return branchName;
}
