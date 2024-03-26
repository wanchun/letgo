import type { IPublicTypeAppConfig, IPublicTypeRootSchema } from '@webank/letgo-types';
import type { Component, InjectionKey, PropType } from 'vue';
import { computed, defineComponent, h, inject, provide, shallowRef, watch } from 'vue';
import config from './config';
import { RENDERER_COMPS } from './renderers';

export interface RendererProps {
    schema: IPublicTypeRootSchema;
    components: Record<string, Component>;
    config?: IPublicTypeAppConfig;
    device?: string;
}

const rendererKey: InjectionKey<{
    device?: string;
    components?: Record<string, Component>;
}> = Symbol('__renderer');

export const Renderer = defineComponent({
    props: {
        schema: {
            type: Object as PropType<IPublicTypeRootSchema>,
            required: true,
        },
        components: {
            type: Object as PropType<Record<string, Component>>,
        },
        /** 设备信息 */
        device: {
            type: String,
            default: undefined,
        },
        extraProps: {
            type: Object as PropType<Record<string, any>>,
            default: undefined,
        },
    },
    setup(props) {
        const provideContent = inject(rendererKey, {});

        const innerDevice = computed(() => {
            return props.device || provideContent.device;
        });

        const componentsRef = shallowRef<Record<string, Component>>({});
        watch(() => props.components, () => {
            componentsRef.value = {
                ...config.getRenderers(),
                ...(props.components || provideContent.components),
            };
        }, {
            immediate: true,
        });

        const renderContent = () => {
            const { value: components } = componentsRef;
            const { schema } = props;
            if (!schema)
                return null;

            const { componentName } = schema!;
            let Comp
                = components[componentName]
                || components[`${componentName}Renderer`];
            if (Comp && !(Comp as any).__renderer__)
                Comp = RENDERER_COMPS[`${componentName}Renderer`];

            return Comp
                ? h(Comp, {
                    key: schema.id,
                    __schema: schema,
                    __components: components,
                    extraProps: props.extraProps,
                    isRoot: provideContent.components == null,
                } as any)
                : null;
        };

        provide(rendererKey, ({
            device: innerDevice.value,
            components: componentsRef.value,
        }));

        return () => {
            const configProvider = config.getConfigProvider();
            return configProvider
                ? h(configProvider, { device: innerDevice.value }, { default: renderContent })
                : renderContent();
        };
    },
}) as new (...args: any[]) => { $props: RendererProps };
