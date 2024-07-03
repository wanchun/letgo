import { omit } from 'lodash-es';
import { request } from '../utils/request';

export class LetgoGlobalBase {
    private _globalCtx: Record<string, any>;
    $request: typeof request;
    constructor(globalCtx: Record<string, any>) {
        this._globalCtx = globalCtx;
        this.$request = window.letgoRequest || request;
    }

    get $utils() {
        return this._globalCtx.$utils;
    }

    get $context() {
        return this._globalCtx.$context;
    }

    get $globalCode() {
        return omit(this._globalCtx, '$utils', '$context');
    }
}
