import { Setter } from '@webank/letgo-types';

import packagesInfo from '../package.json';

const engineExt: {
    version: string;
    setters: Setter[];
} = {
    version: packagesInfo.version,
    setters: [],
};

const win = window as any;
win.AliLowCodeEngineExt = engineExt;

console.log(
    '%c LetgoLowCodeExt %c v'.concat(engineExt.version, ' '),
    'padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #5584ff; font-weight: bold;',
    'padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: #42c02e; font-weight: bold;',
);

export default engineExt;
