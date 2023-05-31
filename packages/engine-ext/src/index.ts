import type { IPublicTypeSetter } from '@webank/letgo-types';
import * as setters from './setter';

export const version = 'ENGINE_EXT_VERSION_PLACEHOLDER';

const engineExt: {
    version: string
    setters: IPublicTypeSetter[]
} = {
    version,
    setters: Object.values(setters),
};

const win = window as any;
win.LetgoEngineExt = engineExt;

console.log(
    '%c LetgoLowCodeExt %c v'.concat(version, ' '),
    'padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #5584ff; font-weight: bold;',
    'padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: #42c02e; font-weight: bold;',
);

export default engineExt;
