/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const rollup = require('rollup');
const babel = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const vanillaExtract = require('@vanilla-extract/rollup-plugin');
const renameExtensions =
    require('@betit/rollup-plugin-rename-extensions').default;

const injectcss = require('./injectcss');
const { extensions } = require('./build-shard');

async function compiler(codePath, outputDir) {
    const extname = path.extname(codePath);
    const outputPath = path.join(
        outputDir,
        `${path.basename(codePath, extname)}.js`,
    );
    const cssFileName = path.join(
        outputDir,
        `${path.basename(codePath, extname)}.css`,
    );
    const bundle = await rollup.rollup({
        input: codePath,
        onwarn(warning, warn) {
            // 跳过未使用模块的警告（tree-shaking 会将其移除）
            if (
                warning.code === 'UNUSED_EXTERNAL_IMPORT' ||
                warning.code === 'PLUGIN_WARNING'
            )
                return;

            // Use default for everything else
            warn(warning);
        },
        external: (id) => {
            id = id.split('?')[0];
            if (
                id.indexOf(codePath) !== -1 ||
                id.endsWith('.css') ||
                id.endsWith('.css.ts') ||
                id.endsWith('vanilla.css')
            ) {
                return false;
            }
            return true;
        },
        plugins: [
            vanillaExtract.vanillaExtractPlugin({
                // cwd: path.dirname(codePath),
            }),
            nodeResolve({
                extensions,
            }),
            renameExtensions({
                mappings: {
                    '.ts': '.js',
                    '.tsx': '.js',
                    '.less': '.css',
                },
            }),
            injectcss(),
            babel.babel({
                targets: 'defaults, Chrome >= 78, not IE 11',
                babelHelpers: 'runtime',
                extensions,
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
            }),
        ],
    });
    if (/.less|css$/.test(extname)) {
        bundle.write({
            // file: cssFileName,
            dir: path.dirname(cssFileName),
            assetFileNames: '[name][extname]',
            format: 'esm',
        });
    } else {
        bundle.write({
            // file: outputPath,
            format: 'esm',
            dir: path.dirname(outputPath),
            assetFileNames: '[name][extname]',
        });
    }
    await bundle.close();
}

module.exports = compiler;
