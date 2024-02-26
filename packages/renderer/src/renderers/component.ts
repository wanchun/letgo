import { defineComponent } from 'vue';
import { Component } from '@webank/letgo-components';
import { rendererProps, useRenderer } from '../core';

export const ComponentRenderer = defineComponent({
    name: 'ComponentRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const { renderComp } = useRenderer(props);

        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components[props.__schema.componentName] || Component);
        };
    },
});
