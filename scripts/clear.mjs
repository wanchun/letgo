/* eslint-disable @typescript-eslint/no-var-requires */
import fse from 'fs-extra'
import { getEsOutputPath, getNeedCompileEsPkg } from './build-shard.mjs';

for (const pkg of getNeedCompileEsPkg()) {
    const outputDir = getEsOutputPath(pkg);
    fse.removeSync(outputDir);
}
