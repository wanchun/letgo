import { defineComponent, watch } from 'vue';
import { Component } from '@webank/letgo-components';
import { rendererProps, useHook, useRenderer } from '../core';
import type { RendererContext } from '../context';
import { createExecuteContext } from '../context/execute-context';

export const ComponentRenderer = defineComponent({
    name: 'ComponentRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        let ctx: RendererContext;
        if (!props.isRoot) {
            ctx = createExecuteContext(props) as RendererContext;

            ctx.executeCtx.props = Object.assign({}, props.__schema.props, props.extraProps);
            ctx.__BASE_COMP = null;

            watch(() => props.extraProps, () => {
                ctx.executeCtx.props = Object.assign({}, props.__schema.props, props.extraProps || {});
            });
        }

        const { renderComp } = useRenderer(props, ctx);
        useHook(ctx.executeCtx);

        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components[props.__schema.componentName] || Component);
        };
    },
});
