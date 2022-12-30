import { PropType, Component, h, computed, defineComponent } from 'vue';
import config from './config';
import { RENDERER_COMPS } from './renderers';
import type { RootSchema } from '@webank/letgo-types';

interface RendererProps {
    schema: RootSchema;
    components: Record<string, Component>;
    device?: string;
}

const Renderer = defineComponent({
    props: {
        schema: {
            type: Object as PropType<RootSchema>,
            required: true,
        },
        components: {
            type: Object as PropType<Record<string, Component>>,
            required: true,
        },
        /** 设备信息 */
        device: {
            type: String,
            default: undefined,
        },
    },
    setup(props: RendererProps) {
        const componentsRef = computed(() => ({
            ...config.getRenderers(),
            ...props.components,
        }));

        console.log('componentsRef:', componentsRef);

        const renderContent = () => {
            const { value: components } = componentsRef;
            const { schema } = props;
            if (!schema) return null;

            const { componentName } = schema!;
            let Comp =
                components[componentName] ||
                components[`${componentName}Renderer`];
            if (Comp && !(Comp as any).__renderer__) {
                Comp = RENDERER_COMPS[`${componentName}Renderer`];
            }

            return Comp
                ? h(Comp, {
                      key: schema.id,
                      __schema: schema,
                      __components: components,
                  } as any)
                : null;
        };

        return () => {
            const { device } = props;
            const configProvider = config.getConfigProvider();
            return configProvider
                ? h(configProvider, { device }, { default: renderContent })
                : renderContent();
        };
    },
}) as new (...args: any[]) => { $props: RendererProps };

export { RendererProps, Renderer };
