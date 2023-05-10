const path = require('node:path');
const rollup = require('rollup');
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');

async function compilerCss(entryPath, outputDir) {
    const extname = path.extname(entryPath);
    const cssFileName = path.join(
        outputDir,
        `${path.basename(entryPath, extname)}.css`,
    );
    const bundle = await rollup.rollup({
        input: entryPath,
        plugins: [
            postcss({
                modules: false,
                extract: true,
                plugins: [postcssImport, postcssNested],
            }),
        ],
        onwarn(warning, warn) {
            if (warning.code === 'FILE_NAME_CONFLICT')
                return;
            warn(warning);
        },
    });
    await bundle.write({
        file: cssFileName,
    });
    await bundle.close();
}

module.exports = {
    compilerCss,
};
