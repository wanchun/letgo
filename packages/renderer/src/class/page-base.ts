import { LetgoGlobalBase } from './global-base';

export class LetgoPageBase extends LetgoGlobalBase {
    compInstances: Record<string, any>;
    codeInstances: Record<string, any>;
    constructor(ctx: {
        globalCtx: Record<string, any>;
        instances: Record<string, any>;
        codes: Record<string, any>;
    }) {
        super(ctx.globalCtx);
        this.compInstances = ctx.instances;
        this.codeInstances = ctx.codes;
    }

    get $pageCode() {
        return this.codeInstances;
    }

    get $refs() {
        return this.compInstances;
    }
}
