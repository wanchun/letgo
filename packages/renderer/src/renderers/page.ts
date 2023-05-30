import { defineComponent, h } from 'vue';
import { rendererProps, useRenderer } from '../core';

const Page = defineComponent((props, { slots }) => {
    return () => h('div', { class: 'letgo-page', ...props }, slots);
});

export const PageRenderer = defineComponent({
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const { renderComp, componentsRef } = useRenderer(props);
        return () => {
            const { __schema: schema } = props;
            const { value: components } = componentsRef;
            return renderComp(schema, components.Page || Page);
        };
    },
});
