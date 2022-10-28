/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const {
    getEsOutputPath,
    getResourcePath,
    getNeedCompilePkg,
    isWatch,
    getOutputDirFromFilePath,
    isFileChange,
} = require('./build-shard');
const compiler = require('./compiler-js');
const { compilerCss } = require('./compiler-css');
const { watch } = require('./watch');

function isScriptFileChange(filePath) {
    const jsPath = filePath.replace('src/', 'es/').replace(/.ts[x]?$/, '.js');
    return isFileChange(filePath, jsPath);
}

function isCssFileChange(filePath) {
    const cssPath = filePath.replace('src/', 'es/').replace(/.less$/, '.css');
    return isFileChange(filePath, cssPath);
}

async function compilerFile(filePath, outputDir, realFilePath) {
    const extname = path.extname(filePath);
    const fileName = path.basename(filePath);
    if (
        ['.ts', '.tsx'].includes(extname) &&
        (realFilePath || isScriptFileChange(filePath))
    ) {
        await compiler(filePath, outputDir);
        console.log(realFilePath || filePath, 'update successfully');
    } else if (
        (/^[a-zA-Z-]+\.css$/.test(fileName) || '.less' === extname) &&
        isCssFileChange(filePath)
    ) {
        await compilerCss(filePath, outputDir);
        console.log(filePath, 'update successfully');
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

function findChangeFile(filePath) {
    const tsFile = filePath.replace('.module.css', '.ts');
    if (fs.existsSync(tsFile)) {
        return tsFile;
    }
    return filePath.replace('.module.css', '.tsx');
}

async function buildEsm() {
    const pkgs = getNeedCompilePkg();
    await compilePkgs(pkgs);
    if (isWatch()) {
        watch(async (filePath) => {
            try {
                let realFilePath = null;
                if (filePath.endsWith('.module.css')) {
                    realFilePath = filePath;
                    filePath = findChangeFile(filePath);
                }
                await compilerFile(
                    filePath,
                    getOutputDirFromFilePath(filePath),
                    realFilePath,
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
