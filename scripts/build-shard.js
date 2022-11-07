/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fse = require('fs-extra');
const uniqueSlug = require('unique-slug');
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

const cache = new Map();
function genCssNamer(file) {
    if (cache.has(file)) return cache.get(file);

    const name = uniqueSlug(fse.readFileSync(file, 'utf8'));
    cache.set(file, `lc${name}`);

    return cache.get(file);
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
    genCssNamer,
    getLibOutputPath,
};
