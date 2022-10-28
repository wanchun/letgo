/* eslint-disable @typescript-eslint/no-var-requires */
const { buildEsm } = require('./build-esm');
const { buildTypes } = require('./build-types');

if (process.argv.includes('--esm')) {
    buildEsm();
}

if (process.argv.includes('--types')) {
    buildTypes();
}
