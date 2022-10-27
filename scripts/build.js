/* eslint-disable @typescript-eslint/no-var-requires */
const fse = require('fs-extra');
const { buildEsm } = require('./build-esm');
const { buildTypes } = require('./build-types');

const { getEsOutputPath, getNeedCompilePkg } = require('./build-shard');

for (const pkg of getNeedCompilePkg()) {
    const outputDir = getEsOutputPath(pkg);
    fse.removeSync(outputDir);
}

if (process.argv.includes('--esm')) {
    buildEsm();
}

if (process.argv.includes('--types')) {
    buildTypes();
}
