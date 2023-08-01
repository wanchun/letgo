import type {
    PropType,
    ShallowReactive,
} from 'vue';
import {
    defineComponent,
    onBeforeMount,
    ref,
    shallowReactive,
} from 'vue';
import type { Designer } from '@harrywan/letgo-designer';
import { DesignerView } from '@harrywan/letgo-designer';
import type { IPluginContext } from '@harrywan/letgo-engine-plugin';
import { designerPluginCls } from './designer.css';

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

        const simulatorProps: ShallowReactive<{ library?: [] }>
            = shallowReactive({});

        const onDesignerMount = (designer: Designer): void => {
            editor.emit('designer.ready', designer);
        };

        onBeforeMount(async () => {
            const assets = await editor.onceGot('assets');
            const device = config.get('device');
            const deviceClassName = config.get('deviceClassName');
            const deviceStyle = config.get('deviceStyle');
            const simulatorUrl = config.get('simulatorUrl');
            const designMode = config.get('designMode');

            const { components, packages, utils } = assets;

            componentMetadatas.value = components || [];

            Object.assign(simulatorProps, {
                library: packages || [],
                utilsMetadata: utils || [],
                simulatorUrl,
                letgoRequest: config.get('letgoRequest'),
                device,
                deviceClassName,
                deviceStyle,
                designMode,
            });
        });

        return () => {
            if (!componentMetadatas.value || !simulatorProps.library)
                return;

            return (
                <DesignerView
                    class={designerPluginCls}
                    editor={editor}
                    designer={designer}
                    onMount={onDesignerMount}
                    componentMetadatas={componentMetadatas.value}
                    simulatorProps={simulatorProps}
                />
            );
        };
    },
});
