import { LetgoGlobalBase } from './global-base';

export class LetgoPageBase extends LetgoGlobalBase {
    compInstances: Record<string, any>;
    codeInstances: Record<string, any>;
    constructor(ctx: {
        globalContext: Record<string, any>;
        instances: Record<string, any>;
        codes: Record<string, any>;
    }) {
        super(ctx.globalContext);
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
