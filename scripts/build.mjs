import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

const args = process.argv.slice(2);

const isDev = args.includes('dev');

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const pkgs = [
    'designer',
    'editor-core',
    'editor-skeleton',
    'engine',
    'renderer',
    'types',
    'utils',
    'simulator-renderer',
    'plugin-components-panel',
    'plugin-designer',
];

const run = (bin, args, opts = {}) =>
    execa(bin, args, { stdio: 'inherit', ...opts });

for (const pkg of pkgs) {
    (async () => {
        const entry = path.resolve(__dirname, `../packages/${pkg}`);
        await run('father', [isDev ? 'dev' : 'build'], {
            cwd: entry,
        });
    })();
}
