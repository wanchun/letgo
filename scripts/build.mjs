import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';
import fse from 'fs-extra';
import dts from 'vite-plugin-dts';
import vueJsx from '@vitejs/plugin-vue-jsx';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// const pkgs = fse.readdirSync(path.resolve(__dirname, '../packages'));

const pkgs = [
    'designer',
    'editor-core',
    'renderer',
    'types',
    'utils',
    'simulator-renderer',
];

for (const pkg of pkgs) {
    (async () => {
        const entry = path.resolve(
            __dirname,
            `../packages/${pkg}/src/index.ts`,
        );
        if (fse.pathExistsSync(entry)) {
            await build({
                root: path.resolve(__dirname, `../packages/${pkg}`),
                build: {
                    minify: false,
                    outDir: 'es',
                    lib: {
                        entry,
                        name: 'MyLib',
                        formats: ['es'],
                        // the proper extensions will be added
                        fileName: 'index',
                    },
                    rollupOptions: {
                        // 确保外部化处理那些你不想打包进库的依赖
                        external: [/^@?[a-zA-Z]/],
                        makeAbsoluteExternalsRelative: false,
                        output: {
                            // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                            globals: {
                                vue: 'Vue',
                            },
                        },
                    },
                },
                plugins: [
                    vueJsx(),
                    dts({
                        entryRoot: 'src',
                        outputDir: 'es',
                    }),
                ],
            });
        }
    })();
}
