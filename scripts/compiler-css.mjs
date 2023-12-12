import { execa } from 'execa';

const run = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts });

export function compilerCss(filePath, outputPath) {
    run('npx', ['lessc', filePath, outputPath]);
}
