import { defineComponent, h } from 'vue';
import { rendererProps, useRenderer } from '../core';

const Page = defineComponent((props, { slots }) => {
    return () => h('div', { class: 'letgo-page', ...props }, slots);
});

export const PageRenderer = defineComponent({
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const { renderComp } = useRenderer(props);
        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components.Page || Page);
        };
    },
});
