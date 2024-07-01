import { defineComponent, inject, reactive } from 'vue';
import { Page } from '@webank/letgo-components';
import { rendererProps, useHook, useRenderer } from '../core';
import { LetgoPageBase } from '../class/page-base';
import { getGlobalContextKey } from '../context';

export const PageRenderer = defineComponent({
    name: 'PageRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const globalContext = inject(getGlobalContextKey(), {});

        const { renderComp, ctx } = useRenderer(props);

        if (!ctx.executeCtx.__this && props.__schema.classCode) {
            // eslint-disable-next-line no-new-func
            const DynamicClass = Function('Page', `return ${props.__schema.classCode.trim()}`)(LetgoPageBase);

            const instance = new DynamicClass({
                globalContext,
                instances: ctx.compInstances,
                codes: ctx.codeInstances,
            });

            ctx.executeCtx.__this = reactive(instance);
        }

        useHook(ctx.executeCtx);

        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components.Page || Page);
        };
    },
});
