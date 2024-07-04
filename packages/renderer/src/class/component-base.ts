import { request } from '../utils/request';

export class LetgoComponentBase {
    $request: typeof request;
    $refs: Record<string, any>;
    $code: Record<string, any>;
    $props: Record<string, any>;
    constructor(ctx: {
        props: Record<string, any>;
        instances: Record<string, any>;
        codes: Record<string, any>;
    }) {
        this.$request = window.letgoRequest || request;
        this.$refs = ctx.instances;
        this.$code = ctx.codes;
        this.$props = ctx.props;
    }
}
