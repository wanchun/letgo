/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const babel = require('@rollup/plugin-babel');
const css = require('@modular-css/rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const rollup = require('rollup');

const {
    extensions,
    getResourcePath,
    getLibOutputPath,
    genCssNamer,
} = require('./build-shard');

async function compiler(source, outputDir, name) {
    const entryPath = path.join(source, 'index.ts');
    const bundle = await rollup.rollup({
        input: entryPath,
        onwarn(warning, warn) {
            // 跳过未使用模块的警告（tree-shaking 会将其移除）
            if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

            // Use default for everything else
            warn(warning);
        },
        external: ['vue'],
        plugins: [
            nodeResolve({
                extensions,
            }),
            babel.babel({
                targets: 'defaults, Chrome >=78, not IE 11',
                babelHelpers: 'runtime',
                extensions,
                include: [/letgo/],
                presets: [
                    '@babel/env',
                    [
                        '@babel/preset-typescript',
                        {
                            allExtensions: true,
                            onlyRemoveTypeImports: true,
                            isTSX: true,
                            jsxPragma: 'h',
                            jsxPragmaFrag: 'Fragment',
                        },
                    ],
                ],
                plugins: [
                    [
                        '@vue/babel-plugin-jsx',
                        {
                            enableObjectSlots: false,
                        },
                    ],
                    ['@babel/plugin-transform-runtime', { useESModules: true }],
                ],
                overrides: [
                    {
                        test: [/[\\/]node_modules[\\/]/, /letgo/],
                        sourceType: 'unambiguous',
                    },
                ],
            }),
            css({
                styleExport: false,
                namer(file, selector) {
                    return genCssNamer(file) + '_' + selector;
                },
                include: '**/*.module.css',
                before: [postcssImport, postcssNested],
            }),
            postcss({
                modules: false,
                extract: true,
                plugins: [postcssImport, postcssNested],
            }),
        ],
    });

    await bundle.write({
        file: path.join(outputDir, 'index.js'),
        format: 'umd',
        name: name,
        assetFileNames: '[name][extname]',
        globals: {
            vue: 'Vue',
        },
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
        await compiler(source, outputDir, pkgs.exportName);
    }
}

module.exports = {
    buildUmd,
};
