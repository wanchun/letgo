/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const {
    getEsOutputPath,
    getResourcePath,
    getNeedCompilePkg,
} = require('./build-shard');
const compiler = require('./esm-jsc');
const { compilerCss } = require('./compiler-css');

async function compilerFiles(source, outputDir) {
    const files = fs.readdirSync(source);
    for (const file of files) {
        const filePath = path.join(source, file);
        const stats = fs.lstatSync(filePath);
        if (stats.isDirectory(filePath) && !/__tests__/.test(file)) {
            await compilerFiles(filePath, path.join(outputDir, file));
        } else if (stats.isFile(filePath)) {
            const extname = path.extname(filePath);
            const fileName = path.basename(filePath);
            if (['.js', '.jsx', '.ts', '.tsx'].includes(extname)) {
                // if (filePath.includes('drag-host')) {
                await compiler(filePath, outputDir);
                // }
            } else if (/^[a-zA-Z-]+\.css$/.test(fileName)) {
                await compilerCss(filePath, outputDir);
            }
        }
    }
}

function compilePkgs(pkgs) {
    for (const pkg of pkgs) {
        const outputDir = getEsOutputPath(pkg);
        fse.removeSync(outputDir);
        const source = getResourcePath(pkg);
        compilerFiles(source, outputDir);
    }
}

function main() {
    const pkgs = getNeedCompilePkg();
    compilePkgs(pkgs);
}

main();
