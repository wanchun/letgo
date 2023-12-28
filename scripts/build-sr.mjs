import process from 'node:process';
import path from 'node:path';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { build } from 'vite';
import dts from 'vite-plugin-dts';
import { getLibOutputPath, getResourcePath, isWatch } from './build-shard.mjs';

async function compiler(source, outDir, name) {
    await build({
        root: source,
        define: {
            'process.env': process.env,
        },
        build: {
            minify: false,
            outDir,
            emptyOutDir: outDir,
            lib: {
                entry: path.join(source, 'index.ts'),
                name,
                formats: ['umd'],
                // the proper extensions will be added
                fileName: 'index',
            },
            rollupOptions: {
                external: ['vue'],
                output: {
                    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        vue: 'Vue',
                    },
                    exports: 'named'
                },
            },
            watch: isWatch(),
        },
        plugins: [vueJsx(), isWatch()
            ? null
            : dts({
                compilerOptions: {
                    rootDir: source,
                },
                outDir: outDir.replace('lib', 'es'),
            })],
    });
}

async function buildSimulator() {
    const pkgs = [
        {
            name: 'simulator-renderer',
            exportName: 'LETGO_SimulatorRenderer',
        },
    ];
    for (const pkg of pkgs) {
        const source = getResourcePath(pkg.name);
        const outputDir = getLibOutputPath(pkg.name);
        await compiler(source, outputDir, pkg.exportName);
    }
}

buildSimulator();
