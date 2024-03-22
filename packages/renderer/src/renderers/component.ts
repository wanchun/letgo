import { defineComponent, provide } from 'vue';
import { Component } from '@webank/letgo-components';
import { rendererProps, useRenderer } from '../core';
import { getPageContextKey } from '..';
import { createExecuteContext } from '../context/execute-context';

export const ComponentRenderer = defineComponent({
    name: 'ComponentRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const contextKey = getPageContextKey();
        const ctx = createExecuteContext(props);

        ctx.executeCtx.props = props.__schema.props || {};

        provide(
            contextKey,
            ctx,
        );

        const { renderComp } = useRenderer(props);

        props.__components.__BASE_COMP = null;

        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components[props.__schema.componentName] || Component);
        };
    },
});
