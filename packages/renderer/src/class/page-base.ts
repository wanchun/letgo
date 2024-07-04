import { LetgoGlobalBase } from './global-base';

export class LetgoPageBase extends LetgoGlobalBase {
    $refs: Record<string, any>;
    $pageCode: Record<string, any>;
    constructor(ctx: {
        globalContext: Record<string, any>;
        instances: Record<string, any>;
        codes: Record<string, any>;
    }) {
        super(ctx.globalContext);
        this.$refs = ctx.instances;
        this.$pageCode = ctx.codes;
    }
}
