import { defineComponent } from 'vue';
import { rendererProps, useRenderer } from '../core';

export const PageRenderer = defineComponent({
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const { renderComp } = useRenderer(props);
        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components.Page);
        };
    },
});
