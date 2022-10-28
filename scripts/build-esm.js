/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const {
    getEsOutputPath,
    getResourcePath,
    getNeedCompilePkg,
    isWatch,
    getOutputDirFromFilePath,
} = require('./build-shard');
const compiler = require('./compiler-js');
const { compilerCss } = require('./compiler-css');
const { watch } = require('./watch');

async function compilerFile(filePath, outputDir) {
    const extname = path.extname(filePath);
    const fileName = path.basename(filePath);
    if (['.js', '.jsx', '.ts', '.tsx'].includes(extname)) {
        await compiler(filePath, outputDir);
    } else if (/^[a-zA-Z-]+\.css$/.test(fileName) || '.less' === extname) {
        await compilerCss(filePath, outputDir);
    }
}

async function compilerFiles(source, outputDir) {
    const files = fs.readdirSync(source);
    for (const file of files) {
        const filePath = path.join(source, file);
        const stats = fs.lstatSync(filePath);
        if (stats.isDirectory(filePath) && !/__tests__/.test(file)) {
            await compilerFiles(filePath, path.join(outputDir, file));
        } else if (stats.isFile(filePath)) {
            await compilerFile(filePath, outputDir);
        }
    }
}

async function compilePkgs(pkgs) {
    for (const pkg of pkgs) {
        const outputDir = getEsOutputPath(pkg);
        const source = getResourcePath(pkg);
        await compilerFiles(source, outputDir);
    }
}

async function buildEsm() {
    const pkgs = getNeedCompilePkg();
    await compilePkgs(pkgs);
    if (isWatch()) {
        watch(async (filePath) => {
            try {
                await compilerFile(
                    filePath,
                    getOutputDirFromFilePath(filePath),
                );
            } catch (err) {
                console.error(err);
            }
        });
    }
}

module.exports = {
    buildEsm,
};
