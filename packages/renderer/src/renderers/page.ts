import { defineComponent } from 'vue';
import { Page } from '@webank/letgo-components';
import { rendererProps, useHook, useRenderer } from '../core';

export const PageRenderer = defineComponent({
    name: 'PageRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const { renderComp, ctx } = useRenderer(props);
        useHook(ctx.executeCtx);
        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components.Page || Page);
        };
    },
});
