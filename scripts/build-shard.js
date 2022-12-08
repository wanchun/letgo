/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fse = require('fs-extra');
const PACKAGE_PATH = path.join(process.cwd(), './packages');

const extensions = ['.js', '.vue', '.jsx', '.json', '.ts', '.tsx'];

function getEsOutputPath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'es');
}

function getLibOutputPath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'lib');
}

function isWatch() {
    return process.argv.includes('--watch');
}

function getResourcePath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'src');
}

function getNeedCompilePkg() {
    const pkgs = fse.readdirSync(PACKAGE_PATH);
    return pkgs.filter(
        (item) =>
            item !== '.DS_Store' &&
            !item.startsWith('_') &&
            !['template', 'simulator-renderer'].includes(item),
    );
}

function getNeedCompileTypePkg() {
    const pkgs = fse.readdirSync(PACKAGE_PATH);
    return pkgs.filter(
        (item) =>
            item !== '.DS_Store' &&
            !item.startsWith('_') &&
            !['template'].includes(item),
    );
}

function getOutputDirFromFilePath(filePath) {
    return path.dirname(filePath).replace('/src', '/es');
}

function isFileChange(from, to) {
    if (fse.existsSync(to)) {
        const stats = fse.lstatSync(from);
        const toStats = fse.lstatSync(to);
        return toStats.mtime < stats.mtime;
    }
    return true;
}

module.exports = {
    PACKAGE_PATH,
    getEsOutputPath,
    getResourcePath,
    getNeedCompilePkg,
    extensions,
    isWatch,
    getOutputDirFromFilePath,
    isFileChange,
    getLibOutputPath,
    getNeedCompileTypePkg,
};
