import { defineComponent, inject, reactive } from 'vue';
import { Page } from '@webank/letgo-components';
import { markClassReactive } from '@webank/letgo-common';
import { rendererProps, useHook, useRenderer } from '../core';
import { LetgoPageBase } from '../class/page-base';
import { getGlobalContextKey } from '../context';
import { executeClassPropReactive } from '../class';

export const PageRenderer = defineComponent({
    name: 'PageRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const globalContext = inject(getGlobalContextKey(), {});

        const { renderComp, ctx } = useRenderer(props);

        if (!ctx.executeCtx.__this && props.__schema.classCode) {
            let DynamicClass: any;
            if (typeof props.__schema.classCode === 'function') {
                DynamicClass = props.__schema.classCode;
            }
            else {
                // eslint-disable-next-line no-new-func
                DynamicClass = Function('Page', `return (${props.__schema.classCode.trim()})`)(LetgoPageBase);
            }

            const instance = new DynamicClass({
                globalContext,
                instances: ctx.compInstances,
                codes: ctx.codeInstances,
            });

            ctx.executeCtx.__this = markClassReactive(instance, (member) => {
                return executeClassPropReactive(instance, member);
            });
        }

        useHook(ctx.executeCtx);

        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components.Page || Page);
        };
    },
});
