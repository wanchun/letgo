/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const rollup = require('rollup');
const fse = require('fs-extra');
const babel = require('@rollup/plugin-babel');
const css = require('@modular-css/rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const uniqueSlug = require('unique-slug');
const renameExtensions =
    require('@betit/rollup-plugin-rename-extensions').default;

const injectcss = require('./injectcss');
const { extensions } = require('./build-shard');

const cache = new Map();
function genCssNamer(file) {
    if (cache.has(file)) return cache.get(file);

    const name = uniqueSlug(fse.readFileSync(file, 'utf8'));
    cache.set(file, `lc${name}`);

    return cache.get(file);
}

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
            if (id.indexOf(codePath) !== -1 || id.endsWith('.module.css')) {
                return false;
            }
            return true;
        },
        plugins: [
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
            css({
                styleExport: false,
                namer(file, selector) {
                    return genCssNamer(file) + '_' + selector;
                },
                include: '**/*.module.css',
                before: [postcssImport, postcssNested],
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
            file: cssFileName,
            assetFileNames: '[name][extname]',
            format: 'esm',
        });
    } else {
        bundle.write({
            file: outputPath,
            format: 'esm',
            assetFileNames: '[name][extname]',
        });
    }

    // closes the bundle
    await bundle.close();
}

module.exports = compiler;
