import { isObject } from 'lodash-es';

export type ESModule = {
    __esModule: true;
    default: any;
};

export function isESModule(obj: unknown): obj is ESModule {
    return isObject(obj) && !!obj.__esModule;
}
