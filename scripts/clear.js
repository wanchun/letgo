/* eslint-disable @typescript-eslint/no-var-requires */
const fse = require('fs-extra');
const { getEsOutputPath, getNeedCompilePkg } = require('./build-shard');

for (const pkg of getNeedCompilePkg()) {
    const outputDir = getEsOutputPath(pkg);
    fse.removeSync(outputDir);
}
