const path = require('node:path');
const { build } = require('vite');
const vueJsx = require('@vitejs/plugin-vue-jsx');
const vanillaExtract = require('@vanilla-extract/vite-plugin');
const { getResourcePath, getLibOutputPath, isWatch } = require('./build-shard');

async function compiler(source, outDir, name) {
    await build({
        root: source,
        define: {
            'process.env': process.env,
        },
        build: {
            minify: false,
            outDir,
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
                },
            },
            watch: isWatch(),
        },
        plugins: [vueJsx(), vanillaExtract.vanillaExtractPlugin({})],
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
