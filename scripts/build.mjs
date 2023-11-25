import { buildEsm }  from './build-es.mjs';

if (process.argv.includes('--esm'))
    buildEsm();
