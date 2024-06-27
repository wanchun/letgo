import { request } from '../utils/request';

export class LetgoComponentBase {
    $request: typeof request;
    compInstances: Record<string, any>;
    codeInstances: Record<string, any>;
    $props: Record<string, any>;
    constructor(ctx: {
        props: Record<string, any>;
        instances: Record<string, any>;
        codes: Record<string, any>;
    }) {
        this.$request = window.letgoRequest || request;
        this.compInstances = ctx.instances;
        this.codeInstances = ctx.codes;
        this.$props = ctx.props;
    }

    get $code() {
        return this.codeInstances;
    }

    get $refs() {
        return this.compInstances;
    }
}
