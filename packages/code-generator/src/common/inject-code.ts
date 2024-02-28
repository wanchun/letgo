import { set } from 'lodash-es';
import { LETGO_CODES } from '../letgo-codes';
import type { FileTree, GenOptions } from './types';

export function injectLetgoCode(fileTree: FileTree, options: GenOptions) {
    const { letgoDir } = options;

    Object.keys(LETGO_CODES).forEach((key) => {
        set(fileTree, `${letgoDir}/${key}`.split('/'), LETGO_CODES[key as keyof typeof LETGO_CODES]);
    });
}
