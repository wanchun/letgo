/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { build } = require('vite');
const vueJsx = require('@vitejs/plugin-vue-jsx');
const { getResourcePath, getLibOutputPath } = require('./build-shard');

async function compiler(source, outDir, name) {
    await build({
        root: source,
        build: {
            minify: false,
            outDir: outDir,
            lib: {
                entry: path.join(source, 'index.ts'),
                name: name,
                formats: ['umd'],
                // the proper extensions will be added
                fileName: 'index',
            },
            rollupOptions: {
                makeAbsoluteExternalsRelative: false,
                output: {
                    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        vue: 'Vue',
                    },
                },
            },
        },
        plugins: [vueJsx()],
    });
}

async function buildUmd() {
    const pkgs = [
        {
            name: 'simulator-renderer',
            exportName: 'LCVueSimulatorRenderer',
        },
    ];
    for (const pkg of pkgs) {
        const source = getResourcePath(pkg.name);
        const outputDir = getLibOutputPath(pkg.name);
        await compiler(source, outputDir, pkg.exportName);
    }
}

module.exports = {
    buildUmd,
};
