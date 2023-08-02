import { Fragment, defineComponent, getCurrentInstance, onMounted } from 'vue';
import { rendererProps, useRenderer } from '../core';
import { useRendererContext } from '../context';

export const ComponentRenderer = defineComponent({
    name: 'ComponentRenderer',
    props: rendererProps,
    __renderer__: true,
    setup(props) {
        const { renderComp } = useRenderer(props);
        const { onCompGetCtx } = useRendererContext();

        const Component = props.__components[props.__schema.componentName] || Fragment;
        const instance = getCurrentInstance();

        if (Component === Fragment) {
            onMounted(() => {
                instance?.proxy && onCompGetCtx(props.__schema, instance.proxy);
            });
        }

        return () => {
            const { __schema: schema } = props;
            return renderComp(schema, props.__components.Block || Fragment);
        };
    },
});
