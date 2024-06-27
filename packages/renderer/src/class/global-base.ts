import { omit } from 'lodash-es';
import { request } from '../utils/request';

export class LetgoGlobalBase {
    globalCtx: Record<string, any>;
    $request: typeof request;
    constructor(globalCtx: Record<string, any>) {
        this.globalCtx = globalCtx;
        this.$request = window.letgoRequest || request;
    }

    get $utils() {
        return this.globalCtx.$utils;
    }

    get $context() {
        return this.globalCtx.$context;
    }

    get $globalCode() {
        return omit(this.globalCtx, '$utils', '$context');
    }
}
