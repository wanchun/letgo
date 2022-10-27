/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fse = require('fs-extra');
const PACKAGE_PATH = path.join(process.cwd(), './packages');

const extensions = ['.js', '.vue', '.jsx', '.json', '.ts', '.tsx'];

function getEsOutputPath(pkg) {
    return path.join(process.cwd(), 'packages', pkg, 'es');
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
            !['letgo-simulator', 'template'].includes(item),
    );
}

module.exports = {
    PACKAGE_PATH,
    getEsOutputPath,
    getResourcePath,
    getNeedCompilePkg,
    extensions,
};
