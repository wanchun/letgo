import {
    defineComponent,
    PropType,
    onBeforeMount,
    ref,
    shallowReactive,
    ShallowReactive,
} from 'vue';
import { DesignerView, Designer } from '@webank/letgo-designer';
import css from './index.module.css';
import type { IPluginContext } from '@webank/letgo-engine';

export default defineComponent({
    name: 'PluginDesigner',
    props: {
        ctx: {
            type: Object as PropType<IPluginContext>,
        },
    },
    setup(props) {
        const { ctx } = props;
        const { editor, designer, config } = ctx;

        const componentMetadatas = ref();

        const simulatorProps: ShallowReactive<{ library?: [] }> =
            shallowReactive({});

        const handleDesignerMount = (designer: Designer): void => {
            editor.emit('designer.ready', designer);
            editor.onGot('schema', (schema) => {
                designer.project.open(schema);
            });
        };

        onBeforeMount(async () => {
            const assets = await editor.onceGot('assets');
            const device = config.get('device');
            const deviceClassName = config.get('deviceClassName');
            const simulatorUrl = config.get('simulatorUrl');
            const designMode = config.get('designMode');

            const { components, packages, utils } = assets;

            componentMetadatas.value = components || [];

            Object.assign(simulatorProps, {
                library: packages || [],
                utilsMetadata: utils || [],
                simulatorUrl,
                device,
                deviceClassName,
                designMode,
            });
        });

        return () => {
            if (!componentMetadatas.value || !simulatorProps.library) {
                return;
            }
            return (
                <DesignerView
                    class={css['letgo-plugin-designer']}
                    editor={editor}
                    designer={designer}
                    onMount={handleDesignerMount}
                    componentMetadatas={componentMetadatas.value}
                    simulatorProps={simulatorProps}
                />
            );
        };
    },
});
